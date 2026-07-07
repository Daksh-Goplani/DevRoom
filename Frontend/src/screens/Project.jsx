import React, { useEffect, useState, useContext, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage, offMessage, disconnectSocket } from '../config/socket'
import { UserContext } from '../context/User.context'
import MarkdownRenderer from '../components/MarkdownRenderer'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webcontainer'

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMembers, setShowMembers] = useState(false)
  const [showAddUsersModal, setShowAddUsersModal] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [project, setProject] = useState(location.state?.project)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const { user } = useContext(UserContext)
  const [fileTree, setFileTree] = useState({})
  const [webContainer, setWebContainer] = useState(null)
  const [draftContent, setDraftContent] = useState('')

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const messageBox = useRef(null)
  const editorRef = useRef(null)
  const highlightRef = useRef(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')
  const hasLoadedProjectFileTree = useRef(false)

  const normalizeFileTree = (tree) => {
    if (!tree || typeof tree !== 'object') return null

    return Object.entries(tree).reduce((acc, [fileName, fileData]) => {
      if (!fileData || typeof fileData !== 'object') return acc

      const entry = fileData.file && typeof fileData.file === 'object' ? fileData.file : fileData
      const contents = typeof entry?.contents === 'string' ? entry.contents : ''

      acc[fileName] = {
        ...entry,
        contents,
      }

      return acc
    }, {})
  }

  const prepareForWebContainer = (tree) => {
    if (!tree || typeof tree !== 'object') return {}

    return Object.entries(tree).reduce((acc, [fileName, fileData]) => {
      if (!fileData || typeof fileData !== 'object') return acc

      const entry = fileData.file && typeof fileData.file === 'object' ? fileData.file : fileData
      const contents = typeof entry?.contents === 'string' ? entry.contents : ''

      acc[fileName] = {
        file: {
          contents
        }
      }

      return acc
    }, {})
  }

  const parseIncomingMessage = (message) => {
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed
        }
        return { text: parsed }
      } catch {
        return { text: message }
      }
    }

    if (message && typeof message === 'object' && !Array.isArray(message)) {
      return message
    }

    return { text: '' }
  }

  useEffect(() => {
    const projectId = location.state?.project?._id

    if (projectId) {
      axiosInstance.get(`/projects/get-project/${projectId}`).then(res => {
        setProject(res.data.project)
      }).catch(err => {
        console.error(err)
      })
    }

    axiosInstance.get("/auth/all").then(res => {
      setAllUsers(res.data?.users)
    }).catch((err) => {
      console.error(err)
    })
  }, [location.state])

  useEffect(() => {
    const sourceTree = project?.fileTree && typeof project.fileTree === 'object'
      ? project.fileTree
      : project?.file && typeof project.file === 'object'
        ? project.file
        : {}

    if (project?._id) {
      setFileTree(sourceTree)
      hasLoadedProjectFileTree.current = true
    } else {
      setFileTree({})
      hasLoadedProjectFileTree.current = false
    }
  }, [project])

  useEffect(() => {
    if (!project?._id || !user) return

    const socket = initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container)
        console.log("container started")
      })
    }

    const handleMessage = async (data) => {
      const incomingMessage = parseIncomingMessage(data.message)

      if (incomingMessage?.fileTree && typeof incomingMessage.fileTree === 'object') {
        const normalized = normalizeFileTree(incomingMessage.fileTree);

        if (normalized && Object.keys(normalized).length > 0) {
          setFileTree(normalized);
          const mountTree = prepareForWebContainer(normalized);
          await webContainer?.mount(mountTree);
        }
      }

      setMessages((current) => [...current, {
        senderId: data.sender,
        senderName: data.senderName || data.senderEmail || data.sender?.email || 'Unknown',
        message: incomingMessage?.text || incomingMessage?.message || '',
        timestamp: data.timestamp || new Date().toISOString()
      }])
    }

    receiveMessage('project-message', handleMessage)

    return () => {
      offMessage('project-message', handleMessage)
      disconnectSocket()
    }
  }, [project?._id, user])

  const handleAddUsers = async () => {
    if (selectedUserIds.length === 0 || !project?._id) return

    try {
      const res = await axiosInstance.put('/projects/add-user', {
        projectId: project._id,
        users: selectedUserIds,
      })

      setProject(res.data.project)
      setSelectedUserIds([])
      setShowAddUsersModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  function send() {
    if (!message.trim() || !project?._id || !user) return

    const payload = {
      projectId: project._id,
      sender: user._id,
      senderId: user._id,
      senderEmail: user.email,
      senderName: user.name || user.email,
      message: message.trim(),
      timestamp: new Date().toISOString()
    }

    sendMessage('project-message', payload)
    setMessages((current) => [...current, payload])
    setMessage('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      send()
    }
  }

  const saveFileTree = async (ft) => {
    if (!project?._id || !hasLoadedProjectFileTree.current) return

    try {
      const normalizedTree = normalizeFileTree(ft)
      const res = await axiosInstance.put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: normalizedTree
      })

      setProject(prevProject => prevProject ? { ...prevProject, fileTree: normalizedTree } : prevProject)
      setSaveStatus('')
      return res.data
    } catch (err) {
      console.error(err)
      setSaveStatus('Save failed')
    }
  }

  if (!project) {
    return (
      <div className='min-h-screen bg-slate-950 px-6 py-10 text-slate-100'>
        <div className='mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-900/70 p-8'>
          <h1 className='text-2xl font-semibold'>No project selected</h1>
          <p className='mt-3 text-sm text-slate-400'>Pick a project from the home screen to view its details.</p>
          <button
            onClick={() => navigate('/')}
            className='hover:cursor-pointer mt-6 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white'>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  const members = project.users || []

  const currentProjectMemberIds = new Set(
    members.map(member => (member?._id || member).toString())
  )
  const addableUsers = allUsers.filter(user => !currentProjectMemberIds.has(user._id?.toString()))

  useEffect(() => {
    if (!messageBox.current) return
    messageBox.current.scrollTop = messageBox.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!project?._id || !hasLoadedProjectFileTree.current || !currentFile) {
      setSaveStatus('')
      return
    }

    setSaveStatus('')
    const timeoutId = setTimeout(() => {
      saveFileTree(fileTree)
    }, 700)

    return () => clearTimeout(timeoutId)
  }, [fileTree, project?._id, currentFile])

  useEffect(() => {
    if (!currentFile) {
      setDraftContent('')
      return
    }

    setDraftContent(fileTree[currentFile]?.contents ?? '')
  }, [currentFile])

  useEffect(() => {
    if (!currentFile || !editorRef.current) return

    requestAnimationFrame(() => {
      editorRef.current?.focus()
      const end = editorRef.current?.value?.length || 0
      editorRef.current?.setSelectionRange(end, end)
    })
  }, [currentFile])

  const updateFileContent = (fileName, updatedContent) => {
    if (!fileName) return

    setDraftContent(updatedContent)

    setFileTree(prevFileTree => {
      const previousEntry = prevFileTree[fileName] || {}
      const previousFile = previousEntry.file && typeof previousEntry.file === 'object'
        ? previousEntry.file
        : {}

      return {
        ...prevFileTree,
        [fileName]: {
          ...previousEntry,
          contents: updatedContent,
          file: {
            ...previousFile,
            contents: updatedContent,
          },
        },
      }
    })
  }

  const activeFileContent = currentFile ? draftContent : ''

  const handleEditorInput = (event) => {
    updateFileContent(currentFile, event.target.value)
  }

  const handleSaveCurrentFileTree = () => {
    if (!currentFile) {
      setSaveStatus('')
      return
    }

    saveFileTree(fileTree)
  }

  const handleEditorKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      const textarea = event.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const nextValue = `${activeFileContent.slice(0, start)}  ${activeFileContent.slice(end)}`

      updateFileContent(currentFile, nextValue)

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2
        textarea.selectionEnd = start +2
      })
    }
  }

  const handleEditorScroll = () => {
    if (highlightRef.current && editorRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft
    }
  }

  const getHighlightedCode = (code = '') => {
    if (!code) return ''

    try {
      return hljs.highlight(code, { language: 'javascript' }).value
    } catch {
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }
  }

  const highlightedCode = getHighlightedCode(activeFileContent)

  const handleRunProject = async () => {
    if (!fileTree || typeof fileTree !== 'object' || Object.keys(fileTree).length === 0) {
      console.error('File tree is empty or invalid')
      return
    }

    const container = webContainer || await getWebContainer()
    setWebContainer(container)

    const mountTree = prepareForWebContainer(fileTree)
    await container.mount(mountTree)

    const installProcess = await container.spawn('npm', ['install'])

    installProcess.output.pipeTo(new WritableStream({
      write(chunk) {
        console.log(chunk)
      }
    }))

    if (runProcess) {
      runProcess.kill()
    }

    const tempRunProcess = await container.spawn('npm', ['start'])

    tempRunProcess.output.pipeTo(new WritableStream({
      write(chunk) {
        console.log(chunk)
      }
    }))

    setRunProcess(tempRunProcess)

    container.on('server-ready', (port, url) => {
      console.log(port, url)
      setIframeUrl(url)
    })
  }

  const renderChatMessage = (msg, index) => {
    const isOwnMessage = String(msg.senderId || msg.sender) === String(user?._id);

    return (
      <div
        key={`${msg.senderId}-${index}-${msg.timestamp}`}
        className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"
          }`}
      >
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
            ? "bg-cyan-500/20 rounded-br-md"
            : "bg-slate-800/80 rounded-bl-md"
            }`}
        >
          <p
            className={`text-sm font-medium ${isOwnMessage ? "text-cyan-200" : "text-slate-200"
              }`}
          >
            {isOwnMessage
              ? "You"
              : msg.senderName || msg.senderEmail || "Unknown"}
          </p>

          <div className="mt-2 prose prose-invert prose-sm max-w-none
          prose-p:my-2
          prose-pre:p-4
        ">
            <MarkdownRenderer>
              {msg.message}
            </MarkdownRenderer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main>
      <style>{`
        .editor-scroll-hide {
          -ms-overflow-style: none;
        }
        .editor-scroll-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className='left scrollbar-none min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] py-4 text-slate-100 sm:px-2 lg:px-2'>
        <div className='relative mx-auto flex h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl'>
          <section
            className="relative flex w-full flex-col overflow-hidden lg:w-[30vw] lg:min-w-[360px]"
          >          <div className='border-b border-white/10 bg-slate-950/70 px-4 py-4 sm:px-5'>
              <div className='flex items-center justify-between gap-3'>
                <button
                  onClick={() => navigate('/')}
                  className='hover:cursor-pointer rounded-full border border-white/10 bg-white/10 p-2 text-slate-300 transition hover:bg-white/20'>
                  <i className='ri-arrow-left-line text-lg'></i>
                </button>

                <div className='flex-1'>
                  <p className='text-xs uppercase tracking-[0.3em] text-cyan-400'>Project chat</p>
                  <h2 className='text-lg font-semibold'>{project.name}</h2>
                </div>

                <button
                  onClick={() => setShowAddUsersModal(true)}
                  className='hover:cursor-pointer rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20'>
                  <i className="ri-user-add-line mr-1"></i>
                  Add
                </button>
                <button
                  onClick={() => setShowMembers(true)}
                  className='hover:cursor-pointer rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20'>
                  <i className='ri-group-line mr-1'></i>
                  Members
                </button>
              </div>
            </div>

            <div ref={messageBox} className='flex-1 space-y-3 overflow-y-auto bg-slate-900/60 p-4 sm:p-5 scrollbar-none scroll-smooth'>
              {messages.length === 0 ? (
                <div className='max-w-[85%] rounded-2xl rounded-bl-md bg-slate-800/80 px-4 py-3 shadow-sm'>
                  <p className='text-sm font-medium text-slate-200'>Welcome to the project chat</p>
                  <p className='mt-1 text-sm leading-6 text-slate-400'>Send a message to start a conversation with your teammates.</p>
                </div>
              ) : (
                messages.map(renderChatMessage)
              )}
            </div>

            <div className='border-t border-white/10 bg-slate-950/70 p-3 sm:p-4'>
              <div className='flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2'>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type='text'
                  placeholder='Write a message...'
                  className='flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500'
                />
                <button
                  onClick={send}
                  className='hover:cursor-pointer rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400'>
                  <i className='ri-send-plane-2-line'></i>
                </button>
              </div>
            </div>

            {/* Members Panel */}
            <div
              className={`absolute inset-0 z-50 transition-all duration-300 ease-in-out ${showMembers
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 pointer-events-none"
                }`}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-slate-950/40"
                onClick={() => setShowMembers(false)}
              />

              {/* Panel */}
              <div className="relative h-full w-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10">

                {/* Header */}
                <div className="border-b border-white/10 bg-slate-950/70 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                        Team
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">
                        Project Members
                      </h3>
                    </div>

                    <button
                      onClick={() => setShowMembers(false)}
                      className="hover:cursor-pointer rounded-full border border-white/10 bg-white/10 p-2 hover:bg-white/20"
                    >
                      <i className="ri-close-line text-lg"></i>
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div className="overflow-y-auto h-[calc(100%-80px)] p-5 space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member._id || index}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                        {(member?.name || member?.email || 'U').charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 text-lg">
                        <p>{member?.name || member?.email || 'Team member'}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </section>

          <div className='hidden flex-1 lg:block' >
            <section className="right flex h-full flex-1 grow flex-row overflow-hidden bg-slate-800">

              <div className="explorer h-full w-56 shrink-0 border-r border-slate-700/80 bg-slate-800/90">
                <div className="file-tree w-full">
                  {
                    Object.keys(fileTree || {}).map((file, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentFile(file)
                          setOpenFiles([...new Set([...openFiles, file])])
                        }}
                        className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-700 w-full">
                        <p
                          className='font-semibold text-lg'
                        >{file}</p>
                      </button>))

                  }
                </div>

              </div>

              <div className="code-editor flex h-full min-w-0 flex-1 flex-col bg-slate-900">

                <div className="top flex w-full items-center justify-between border-b border-slate-700/80 bg-slate-900/95 px-3 py-2">

                  <div className="files flex">
                    {
                      openFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentFile(file)}
                          className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-700 ${currentFile === file ? 'bg-slate-600' : ''}`}>
                          <p
                            className='font-semibold text-lg'
                          >{file}</p>
                        </button>
                      ))
                    }
                  </div>

                  <div className="actions flex items-center gap-2">
                    <span className="text-xs text-slate-400">{saveStatus}</span>
                    <button
                      onClick={handleSaveCurrentFileTree}
                      className='rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/20'
                    >
                      Save
                    </button>
                    <button
                      onClick={handleRunProject}
                      className='rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400'
                    >
                      Run
                    </button>
                  </div>

                </div>
                <div className="bottom flex min-h-0 flex-1 overflow-auto">
                  {
                    fileTree[currentFile] && (
                      <div className="code-editor-area scrollbar-none relative h-full min-h-0 flex-1 overflow-auto bg-slate-950">
                        <pre
                          ref={highlightRef}
                          className="editor-scroll-hide pointer-events-none min-h-full w-full overflow-auto whitespace-pre wrap-break-word p-4 font-mono text-sm leading-6 text-slate-100"
                          style={{ tabSize: 2, margin: 0 }}
                          dangerouslySetInnerHTML={{ __html: highlightedCode }}
                        />

                        <textarea
                          ref={editorRef}
                          value={activeFileContent}
                          onInput={handleEditorInput}
                          onKeyDown={handleEditorKeyDown}
                          onScroll={handleEditorScroll}
                          spellCheck={false}
                          wrap="off"
                          className="editor-scroll-hide absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-cyan-400 outline-none"
                          style={{
                            whiteSpace: 'pre',
                            // lineHeight: '1.5',
                            // tabSize: 2,
                            margin: 0,
                            boxSizing: 'border-box',
                            letterSpacing: 'normal',
                          }}
                        />
                      </div>
                    )
                  }
                </div>


              </div>

              {iframeUrl && webContainer &&
                (<div className="flex min-w-[28rem] flex-col h-full">
                  <div className="address-bar">
                    <input type="text"
                      onChange={(e) => setIframeUrl(e.target.value)}
                      value={iframeUrl} className="w-full p-2 px-4 bg-slate-200 text-slate-900" />
                  </div>
                  <iframe src={iframeUrl} className="w-full bg-slate-400 h-full"></iframe>
                </div>)
              }

            </section>
          </div>
        </div>

        {/* Add Users Modal */}
        {showAddUsersModal && (
          <>
            {/* Backdrop */}
            <div
              className='fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm'
              onClick={() => setShowAddUsersModal(false)}
            />

            {/* Modal */}
            <div className='fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 md:px-8'>
              <div className='w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl overflow-hidden flex flex-col max-h-[90vh]'>
                {/* Modal Header */}
                <div className='border-b border-white/10 bg-slate-950/70 px-5 py-4 shrink-0'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-xs uppercase tracking-[0.3em] text-cyan-400'>Users</p>
                      <h3 className='mt-1 text-xl font-semibold'>Add members to project</h3>
                    </div>
                    <button
                      onClick={() => setShowAddUsersModal(false)}
                      className='hover:cursor-pointer rounded-full border border-white/10 bg-white/10 p-2 text-slate-300 transition hover:bg-white/20'>
                      <i className='ri-close-line text-lg'></i>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className='overflow-y-auto flex-1'>
                  <div className='p-5 space-y-2 max-h-[calc(90vh-160px)]'>
                    {addableUsers.length > 0 ? (
                      addableUsers.map((user, index) => {
                        const isSelected = selectedUserIds.includes(user._id)
                        return (
                          <div
                            key={user._id || index}
                            onClick={() => {
                              setSelectedUserIds(current => {
                                if (current.includes(user._id)) {
                                  return current.filter(id => id !== user._id)
                                }
                                return [...current, user._id]
                              })
                            }}
                            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition ${isSelected
                              ? 'border-cyan-400 bg-cyan-500/20'
                              : 'border-white/10 bg-slate-950/50 hover:bg-slate-950/80'
                              }`}
                          >
                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-300 shrink-0'>
                              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-lg font-semibold text-white truncate'>{user?.name || user?.email || 'User'}</p>
                              {/* <p className='text-xs text-slate-400 truncate'>{user?.email || 'No email'}</p> */}
                            </div>
                            {isSelected && (
                              <div className='shrink-0'>
                                <i className='ri-check-line text-cyan-400 text-xl'></i>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className='rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400 text-center'>No users available to add.</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className='border-t border-white/10 bg-slate-950/70 px-5 py-4 shrink-0 flex gap-3 justify-end'>
                  <button
                    onClick={() => {
                      setSelectedUserIds([])
                      setShowAddUsersModal(false)
                    }}
                    className='hover:cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/20'>
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUsers}
                    disabled={selectedUserIds.length === 0}
                    className='rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer'>
                    Add Members
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </main>
  )
}

export default Project