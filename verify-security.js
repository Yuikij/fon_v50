#!/usr/bin/env node

/**
 * 安全验证脚本
 * 检查敏感文件是否会暴露给前端
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始安全验证...\n');

// 检查构建产物
const distDirs = ['dist/dev', 'dist/prod', 'dist/test'];

function checkDistributionSafety() {
    console.log('📁 检查构建产物安全性:');
    
    distDirs.forEach(distDir => {
        if (!fs.existsSync(distDir)) {
            console.log(`  ⚠️  ${distDir} 不存在，请先运行构建`);
            return;
        }
        
        console.log(`\n  📂 检查 ${distDir}:`);
        
        // 检查是否包含敏感文件
        const sensitiveFiles = [
            'functions',
            'chat.js',
            '.env',
            '.dev.vars',
            'wrangler.toml'
        ];
        
        let hasIssues = false;
        
        sensitiveFiles.forEach(file => {
            const filePath = path.join(distDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`    ❌ 发现敏感文件: ${file}`);
                hasIssues = true;
            }
        });
        
        if (!hasIssues) {
            console.log(`    ✅ 无敏感文件暴露`);
        }
        
        // 检查是否包含环境变量
        try {
            const files = fs.readdirSync(distDir);
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    const content = fs.readFileSync(path.join(distDir, file), 'utf8');
                    // 检测真正的硬编码API密钥（AIza后面跟着更多字符）
                    const apiKeyPattern = /AIza[A-Za-z0-9_-]{35,}/;
                    if (apiKeyPattern.test(content)) {
                        console.log(`    ❌ 检测到硬编码API密钥在: ${file}`);
                        hasIssues = true;
                    }
                }
            });
        } catch (e) {
            // 忽略错误
        }
    });
}

function checkServerSideFiles() {
    console.log('\n🔒 检查服务器端文件:');
    
    const serverFiles = [
        'functions/api/chat.js',
        '.dev.vars',
        'wrangler.toml'
    ];
    
    serverFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ 服务器端文件存在: ${file}`);
        } else {
            console.log(`  ⚠️  服务器端文件缺失: ${file}`);
        }
    });
}

function checkConfigSafety() {
    console.log('\n⚙️  检查配置安全性:');
    
    try {
        // 检查config.js中的端点配置
        const configContent = fs.readFileSync('config.js', 'utf8');
        
        if (configContent.includes("proxy: '/api/chat'")) {
            console.log('  ✅ API端点使用相对路径（安全）');
        } else if (configContent.includes('llmproxy.yuisama.top')) {
            console.log('  ⚠️  仍在使用外部代理端点');
        }
        
        // 检查是否有硬编码的API密钥
        if (configContent.includes('AIza') && !configContent.includes('getEnv')) {
            console.log('  ❌ 检测到硬编码API密钥');
        } else {
            console.log('  ✅ 未发现硬编码API密钥');
        }
        
    } catch (e) {
        console.log('  ❌ 无法读取config.js');
    }
}

function printSecuritySummary() {
    console.log('\n📋 安全架构总结:');
    console.log('  🌐 前端 (用户可见):');
    console.log('    - 静态文件: HTML, CSS, JS');
    console.log('    - API调用: 仅发送HTTP请求到 /api/chat');
    console.log('    - 无法访问: 服务器端代码和环境变量');
    
    console.log('\n  🖥️  服务器端 (用户不可见):');
    console.log('    - functions/api/chat.js: 运行在Cloudflare Edge');
    console.log('    - 环境变量: 存储在Cloudflare服务器端');
    console.log('    - API密钥: 只在服务器端可用');
    
    console.log('\n  🔐 请求流程:');
    console.log('    前端 → HTTP请求 → Pages Functions → Gemini API → 返回结果');
}

// 执行检查
checkDistributionSafety();
checkServerSideFiles();
checkConfigSafety();
printSecuritySummary();

console.log('\n✅ 安全验证完成！');
console.log('\n💡 提示: 运行 `npm run build:prod` 然后再次运行此脚本来验证构建产物安全性。'); 