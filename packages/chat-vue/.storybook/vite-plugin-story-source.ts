/**
 * Vite 插件：自动为 *.story.vue 组件注入源码
 *
 * 实现思路：
 * 1. 遍历 SourceFile 的 statements
 * 2. 找到 ImportDeclaration，检查是否导入 .story.vue 文件
 * 3. 添加对应的 ?raw 导入（变量名为 __原变量名）
 * 4. 遍历 VariableStatement，找到 Story 类型的导出
 * 5. 检查 render 函数返回的对象中是否有 template 属性匹配 <组件名 />
 * 6. 为匹配的 story 添加 parameters.docs.source.code
 */

import type { Plugin } from 'vite';
import { Project, SyntaxKind, type SourceFile } from 'ts-morph';

interface StoryVueImport {
  importName: string;
  rawVarName: string;
  modulePath: string;
}

export function storySourcePlugin(): Plugin {
  return {
    name: 'vite-plugin-story-source',
    enforce: 'pre',

    transform(code: string, id: string) {
      if (!id.endsWith('.stories.ts')) {
        return null;
      }

      const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: { allowJs: true },
      });

      const sourceFile = project.createSourceFile('temp.ts', code);

      // 1. 收集 .story.vue 导入
      const storyImports: StoryVueImport[] = [];
      const rawImports: string[] = [];

      for (const statement of sourceFile.getStatements()) {
        if (statement.getKind() !== SyntaxKind.ImportDeclaration) continue;

        const importDecl = statement.asKind(SyntaxKind.ImportDeclaration);
        if (!importDecl) continue;

        const moduleSpecifier = importDecl.getModuleSpecifier();
        const modulePath = moduleSpecifier.getLiteralText();

        if (!modulePath.endsWith('.story.vue')) continue;

        const defaultImport = importDecl.getDefaultImport();
        if (!defaultImport) continue;

        const importName = defaultImport.getText();
        const rawVarName = `__${importName}`;

        storyImports.push({ importName, rawVarName, modulePath });
        rawImports.push(`import ${rawVarName} from '${modulePath}?raw';`);
      }

      if (storyImports.length === 0) {
        return null;
      }

      // 2. 建立映射 importName -> rawVarName
      const importMap = new Map<string, string>();
      for (const { importName, rawVarName } of storyImports) {
        importMap.set(importName, rawVarName);
      }

      // 3. 查找需要注入 source 的 story
      const storySourceAssignments: string[] = [];

      for (const statement of sourceFile.getStatements()) {
        if (statement.getKind() !== SyntaxKind.VariableStatement) continue;

        const varStatement = statement.asKind(SyntaxKind.VariableStatement);
        if (!varStatement || !varStatement.isExported()) continue;

        for (const decl of varStatement.getDeclarationList().getDeclarations()) {
          const name = decl.getName();
          const typeNode = decl.getTypeNode();

          if (!typeNode || typeNode.getText() !== 'Story') continue;

          const initializer = decl.getInitializer();
          if (!initializer || initializer.getKind() !== SyntaxKind.ObjectLiteralExpression) continue;

          const objLiteral = initializer.asKind(SyntaxKind.ObjectLiteralExpression);
          if (!objLiteral) continue;

          const renderProp = objLiteral.getProperty('render');
          if (!renderProp) continue;

          const renderText = renderProp.getText();

          // 查找匹配的 story 组件
          for (const [importName, rawVarName] of importMap) {
            const pattern = new RegExp(`template:\\s*['"\`]<${importName}\\s*/>['"\`]`);
            if (pattern.test(renderText)) {
              storySourceAssignments.push(
                `${name}.parameters = { docs: { source: { code: ${rawVarName}, language: 'html' } } };`
              );
              break;
            }
          }
        }
      }

      if (storySourceAssignments.length === 0) {
        return null;
      }

      // 4. 生成新代码
      // 在第一个 import 后插入 raw imports
      const firstImportEnd = sourceFile.getImportDeclarations()[0]?.getEnd() ?? 0;
      const beforeFirstImport = code.slice(0, firstImportEnd);
      const afterFirstImport = code.slice(firstImportEnd);

      const newCode = beforeFirstImport +
        '\n' + rawImports.join('\n') +
        afterFirstImport.trimEnd() +
        '\n\n' + storySourceAssignments.join('\n') + '\n';

      return {
        code: newCode,
        map: null,
      };
    },
  };
}

export default storySourcePlugin;
