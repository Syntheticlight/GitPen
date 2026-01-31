#!/bin/bash

# GitPen 部署脚本
# 构建项目并自动推送到 GitHub 仓库

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 远程仓库配置
REMOTE_URL="https://github.com/Syntheticlight/GitPen"
REMOTE_NAME="origin"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 git 是否可用
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "git 未安装，请先安装 git"
        exit 1
    fi
}

# 检查 npm 是否可用
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 Node.js 和 npm"
        exit 1
    fi
}

# 配置远程仓库
setup_remote() {
    print_info "检查远程仓库配置..."
    
    # 检查是否已经是 git 仓库
    if [ ! -d ".git" ]; then
        print_info "初始化 git 仓库..."
        git init
    fi
    
    # 检查远程仓库是否已配置
    if git remote get-url "$REMOTE_NAME" &> /dev/null; then
        CURRENT_URL=$(git remote get-url "$REMOTE_NAME")
        if [ "$CURRENT_URL" != "$REMOTE_URL" ]; then
            print_warn "更新远程仓库 URL: $CURRENT_URL -> $REMOTE_URL"
            git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
        fi
    else
        print_info "添加远程仓库: $REMOTE_URL"
        git remote add "$REMOTE_NAME" "$REMOTE_URL"
    fi
}

# 执行构建
run_build() {
    print_info "开始构建项目..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_info "构建成功！"
    else
        print_error "构建失败！"
        exit 1
    fi
}

# 提交并推送
git_push() {
    print_info "准备提交更改..."
    
    # 获取提交信息
    COMMIT_MSG="${1:-"build: auto deploy $(date '+%Y-%m-%d %H:%M:%S')"}"
    
    # 添加所有更改
    git add -A
    
    # 检查是否有更改需要提交
    if git diff --cached --quiet; then
        print_warn "没有更改需要提交"
    else
        print_info "提交更改: $COMMIT_MSG"
        git commit -m "$COMMIT_MSG"
    fi
    
    # 获取当前分支名
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    
    print_info "推送到远程仓库 ($REMOTE_NAME/$BRANCH)..."
    
    if git push "$REMOTE_NAME" "$BRANCH"; then
        print_info "推送成功！"
    else
        print_error "推送失败！请检查网络连接和仓库权限"
        print_error "远程仓库: $REMOTE_URL"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "GitPen 部署脚本"
    echo ""
    echo "用法: ./deploy.sh [选项] [提交信息]"
    echo ""
    echo "选项:"
    echo "  -h, --help      显示帮助信息"
    echo "  -b, --build     仅构建，不推送"
    echo "  -p, --push      仅推送，不构建"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh                           # 构建并推送"
    echo "  ./deploy.sh \"feat: add new feature\"   # 使用自定义提交信息"
    echo "  ./deploy.sh -b                        # 仅构建"
    echo "  ./deploy.sh -p                        # 仅推送"
}

# 主函数
main() {
    BUILD=true
    PUSH=true
    COMMIT_MSG=""
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--build)
                PUSH=false
                shift
                ;;
            -p|--push)
                BUILD=false
                shift
                ;;
            *)
                COMMIT_MSG="$1"
                shift
                ;;
        esac
    done
    
    print_info "GitPen 部署脚本启动"
    echo "================================"
    
    # 检查依赖
    check_git
    check_npm
    
    # 配置远程仓库
    setup_remote
    
    # 执行构建
    if [ "$BUILD" = true ]; then
        run_build
    fi
    
    # 推送到远程仓库
    if [ "$PUSH" = true ]; then
        git_push "$COMMIT_MSG"
    fi
    
    echo "================================"
    print_info "部署完成！"
}

# 执行主函数
main "$@"
