#!/bin/bash

# 批量打包 packages 到指定目录，用于本地开发调试

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGES_DIR="$ROOT_DIR/packages"
DEFAULT_OUTPUT_DIR="/tmp/incremark-packs"

# 输出目录，默认为 /tmp/incremark-packs
OUTPUT_DIR="${1:-$DEFAULT_OUTPUT_DIR}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Packing all packages to: ${CYAN}$OUTPUT_DIR${NC}"
echo ""

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 清空旧的打包文件
rm -f "$OUTPUT_DIR"/*.tgz

# 收集所有包信息
declare -a PACK_COMMANDS=()

for pkg_dir in "$PACKAGES_DIR"/*; do
  if [ -d "$pkg_dir" ] && [ -f "$pkg_dir/package.json" ]; then
    pkg_name=$(node -p "require('$pkg_dir/package.json').name")
    pkg_version=$(node -p "require('$pkg_dir/package.json').version")

    echo -e "  Packing ${GREEN}$pkg_name@$pkg_version${NC}..."
    (cd "$pkg_dir" && pnpm pack --pack-destination "$OUTPUT_DIR" 2>/dev/null)
  fi
done

echo ""
echo -e "${GREEN}All packages packed!${NC}"
echo ""
echo "Packed files:"
ls -la "$OUTPUT_DIR"/*.tgz 2>/dev/null | awk '{print "  " $NF}'
echo ""
echo -e "${YELLOW}To install in another project:${NC}"
echo ""
echo "  pnpm add /tmp/incremark-packs/incremark-chat-vue-*.tgz"
