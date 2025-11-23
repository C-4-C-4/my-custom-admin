'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  // 🔴 修复点 1：明确告诉 TS 这是一个存放任意数据的数组
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [sha, setSha] = useState(''); 
  const [loading, setLoading] = useState(false);

  // 1. 加载文件列表
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFiles(data);
        } else {
          console.error("API返回错误:", data);
          // alert("获取文章失败，请检查 Vercel 环境变量配置是否正确");
        }
      })
      .catch(err => console.error(err));
  }, []);

  // 2. 点击文件加载内容
  const loadFile = async (filename: string) => {
    setLoading(true);
    setSelectedFile(filename);
    try {
      const res = await fetch(`/api/file?filename=${filename}`);
      const data = await res.json();
      setContent(data.content);
      setSha(data.sha);
    } catch (e) {
      alert("读取文件失败");
    }
    setLoading(false);
  };

  // 3. 保存修改
  const saveFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile,
          content: content,
          sha: sha 
        })
      });
      
      if (res.ok) {
        alert('✅ 保存成功！VitePress 正在重新构建...');
        loadFile(selectedFile); // 刷新 SHA
      } else {
        const err = await res.json();
        alert('❌ 保存失败: ' + (err.error || '未知错误'));
      }
    } catch (e) {
      alert('保存请求发送失败');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', color: '#333' }}>
      {/* 左侧列表 */}
      <div style={{ width: '260px', borderRight: '1px solid #eee', padding: '20px', overflowY: 'auto', background: '#f9f9f9' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>文章列表</h2>
        {files.length === 0 && <p style={{color: '#888'}}>加载中...</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {/* 这里的 any 是为了绕过 TS 检查 */}
          {files.map((file: any) => (
            <li 
              key={file.name} 
              onClick={() => loadFile(file.name)}
              style={{ 
                cursor: 'pointer', 
                padding: '10px', 
                borderRadius: '6px',
                marginBottom: '5px',
                background: selectedFile === file.name ? '#0070f3' : 'transparent',
                color: selectedFile === file.name ? '#fff' : '#333'
              }}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧编辑区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px' }}>
        {selectedFile ? (
          <>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>正在编辑: {selectedFile}</h3>
              <button 
                onClick={saveFile} 
                disabled={loading} 
                style={{ 
                  padding: '10px 20px', 
                  background: loading ? '#ccc' : '#0070f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '处理中...' : '保存修改'}
              </button>
            </div>
            <textarea
              style={{ 
                flex: 1, 
                width: '100%', 
                padding: '15px', 
                fontSize: '16px', 
                lineHeight: '1.6', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                fontFamily: 'monospace',
                resize: 'none',
                outline: 'none'
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
            👈 请在左侧选择一篇文章开始编辑
          </div>
        )}
      </div>
    </div>
  );
}