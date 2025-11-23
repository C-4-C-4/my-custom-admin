import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function GET() {
  try {
    const { data } = await octokit.repos.getContent({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: process.env.TARGET_PATH,
    });
    
    // 过滤出 .md 文件
    const files = data.filter(file => file.name.endsWith('.md'));
    
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}