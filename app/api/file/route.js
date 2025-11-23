import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 读取文件内容
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  try {
    const { data } = await octokit.repos.getContent({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: `${process.env.TARGET_PATH}/${filename}`,
    });

    // GitHub 返回的内容是 Base64 编码的，需要解码
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return NextResponse.json({ content, sha: data.sha });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 保存文件 (Push Commit)
export async function POST(request) {
  const body = await request.json();
  const { filename, content, sha } = body;

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: `${process.env.TARGET_PATH}/${filename}`,
      message: `Update ${filename} via Custom Admin`, // Commit 信息
      content: Buffer.from(content).toString('base64'), // 转回 Base64
      sha: sha, // 必须带上原文件的 SHA，否则 GitHub 会报错（防止冲突）
      branch: 'main' // 你的主分支
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}