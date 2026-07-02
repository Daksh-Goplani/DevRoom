import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const project = location.state?.project
  const [showMembers, setShowMembers] = useState(false)

  if (!project) {
    return (
      <div className='min-h-screen bg-slate-950 px-6 py-10 text-slate-100'>
        <div className='mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-900/70 p-8'>
          <h1 className='text-2xl font-semibold'>No project selected</h1>
          <p className='mt-3 text-sm text-slate-400'>Pick a project from the home screen to view its details.</p>
          <button
            onClick={() => navigate('/')}
            className='mt-6 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white'>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  const members = project.users || []

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-4 text-slate-100 sm:px-6 lg:px-8'>
      <div className='mx-auto flex h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl'>
        <section className='flex w-full flex-col lg:w-[30vw] lg:min-w-[360px]'>
          <div className='border-b border-white/10 bg-slate-950/70 px-4 py-4 sm:px-5'>
            <div className='flex items-center justify-between gap-3'>
              <button
                onClick={() => navigate('/')}
                className='rounded-full border border-white/10 bg-white/10 p-2 text-slate-300 transition hover:bg-white/20'>
                <i className='ri-arrow-left-line text-lg'></i>
              </button>

              <div className='flex-1'>
                <p className='text-xs uppercase tracking-[0.3em] text-cyan-400'>Project chat</p>
                <h2 className='text-lg font-semibold'>{project.name}</h2>
              </div>

              <button
                onClick={() => setShowMembers(true)}
                className='rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20'>
                <i className='ri-group-line mr-1'></i>
                Members
              </button>
            </div>
          </div>

          <div className='flex-1 space-y-3 overflow-y-auto bg-slate-900/60 p-4 sm:p-5'>
            <div className='max-w-[85%] rounded-2xl rounded-bl-md bg-slate-800/80 px-4 py-3 shadow-sm'>
              <p className='text-sm font-medium text-slate-200'>Welcome to the workspace</p>
              <p className='mt-1 text-sm leading-6 text-slate-400'>Share updates, ideas, and quick notes with your teammates here.</p>
            </div>

            <div className='ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-cyan-500/20 px-4 py-3 shadow-sm'>
              <p className='text-sm font-medium text-cyan-200'>You</p>
              <p className='mt-1 text-sm leading-6 text-cyan-100'>Looking good. I’ll start the first task list soon.</p>
            </div>
          </div>

          <div className='border-t border-white/10 bg-slate-950/70 p-3 sm:p-4'>
            <div className='flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2'>
              <input
                type='text'
                placeholder='Write a message...'
                className='flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500'
              />
              <button className='rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400'>
                <i className='ri-send-plane-2-line'></i>
              </button>
            </div>
          </div>
        </section>

        <aside className='hidden flex-1 lg:block' />
      </div>

      {showMembers && (
        <div className='fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 px-4 py-6'>
          <div className='w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl shadow-cyan-500/10'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-cyan-400'>Team</p>
                <h3 className='mt-1 text-xl font-semibold'>Project members</h3>
              </div>
              <button
                onClick={() => setShowMembers(false)}
                className='rounded-full border border-white/10 bg-white/10 p-2 text-slate-300 transition hover:bg-white/20'>
                <i className='ri-close-line text-lg'></i>
              </button>
            </div>

            <div className='mt-5 space-y-3'>
              {members.length > 0 ? (
                members.map((member, index) => (
                  <div key={member._id || index} className='flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-300'>
                      {(member?.name || member?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-white'>{member?.name || member?.email || 'Team member'}</p>
                      <p className='text-xs text-slate-400'>{member?.email || 'Project collaborator'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400'>No members found for this project yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Project