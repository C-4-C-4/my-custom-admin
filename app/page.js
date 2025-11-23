'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(false);
  // 新增：错误状态显示
  const [errorMsg, setErrorMsg] = useState('');

  // 1. 加载文件列表
  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('/api/posts');
        // 先判断 HTTP 状态码
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API Error ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        
        // 再次确认拿到的是不是数组
        if (Array.isArray(data)) {
          setFiles(data);
        } else {
          // 如果后端返回了 { error: ... }
          throw new Error(data.error || '返回的数据格式不对');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message); // 把错误显示在页面上
      }
    }
    fetchFiles();
  }, []);

  // 2. 点击文件加载内容
  const loadFile = async (filename) => {
    setLoading(true);
    setErrorMsg(''); // 清除旧错误
    try {
      setSelectedFile(filename);
      const res = await fetch(`/api/file?filename=${filename}`);
      if (!res.ok) throw new Error('读取文件失败');
      
      const data = await res.json();
      setContent(data.content);
      setSha(data.sha);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. 保存修改
  const saveFile = async () => {
    setLoading(true);
    setErrorMsg('');
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
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || '保存失败');
      }

      alert('保存成功！Vercel 正在重新构建你的博客...');
      // 重新加载以更新 sha
      await loadFile(selectedFile);
    } catch (err) {
      alert('保存出错: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* 左侧边栏 */}
      <div style={{ width: '280px', borderRight: '1px solid #ccc', padding: '20px', overflowY: 'auto', background: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0 }}>文章列表</h3>
        
        {/* 🔴 错误提示区域 */}
        {errorMsg && (
          <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', wordBreak: 'break-all' }}>
            ❌ {errorMsg}
          </div>
        )}

        {files.length === 0 && !errorMsg && <p>加载中...</p>}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {files.map(file => (
            <li 
              key={file.name} 
              onClick={() => loadFile(file.name)}
              style={{ 
                cursor: 'pointer', 
                padding: '10px', 
                marginBottom: '5px',
                borderRadius: '4px',
                background: selectedFile === file.name ? '#0070f3' : 'white',
                color: selectedFile === file.name ? 'white' : '#333',
                border: '1px solid #eee'
              }}
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
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '18px' }}>{selectedFile}</strong>
              <button 
                onClick={saveFile} 
                disabled={loading} 
                style={{ 
                  padding: '8px 16px', 
                  background: '#0070f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '正在提交...' : '保存修改'}
              </button>
            </div>
            <textarea
              style={{ 
                flex: 1, 
                width: '100%', 
                fontFamily: 'monospace', 
                padding: '15px', 
                fontSize: '14px', 
                lineHeight: '1.6',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'none'
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
            <p>请在左侧选择一篇文章开始编辑</p>
          </div>
        )}
      </div>
    </div>
  );
}