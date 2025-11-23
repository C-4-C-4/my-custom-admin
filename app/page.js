'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [sha, setSha] = useState(''); // SHA 是 Git 的版本指纹，保存时必须带上
  const [loading, setLoading] = useState(false);

  // 1. 加载文件列表
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setFiles(data));
  }, []);

  // 2. 点击文件加载内容
  const loadFile = async (filename) => {
    setLoading(true);
    setSelectedFile(filename);
    const res = await fetch(`/api/file?filename=${filename}`);
    const data = await res.json();
    setContent(data.content);
    setSha(data.sha);
    setLoading(false);
  };

  // 3. 保存修改
  const saveFile = async () => {
    setLoading(true);
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: selectedFile,
        content: content, // 编辑后的内容
        sha: sha 
      })
    });
    
    if (res.ok) {
      alert('保存成功！Vercel 正在重新构建你的博客...');
      // 重新加载以获取新的 sha
      loadFile(selectedFile); 
    } else {
      alert('保存失败');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 左侧文件列表 */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <h3>文章列表</h3>
        <ul>
          {files.map(file => (
            <li 
              key={file.name} 
              onClick={() => loadFile(file.name)}
              style={{ cursor: 'pointer', padding: '5px', background: selectedFile === file.name ? '#eee' : 'transparent' }}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧编辑器 */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {selectedFile ? (
          <>
            <div style={{ marginBottom: '10px' }}>
              <strong>正在编辑: {selectedFile}</strong>
              <button onClick={saveFile} disabled={loading} style={{ marginLeft: '10px' }}>
                {loading ? '处理中...' : '保存修改'}
              </button>
            </div>
            <textarea
              style={{ flex: 1, width: '100%', fontFamily: 'monospace', padding: '10px' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <p>请选择一篇文章进行编辑</p>
        )}
      </div>
    </div>
  );
}