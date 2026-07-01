import React, { useContext, useState } from 'react'
import { UserContext } from '../context/User.context'
import axiosInstance, { extractApiErrorMessage } from '../config/axios'

const Home = () => {
  const user  = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const closeModal = () => {
    setIsModalOpen(false)
    setProjectName('')
    setFeedback({ type: '', message: '' })
  }

  async function createProject(e) {
    e.preventDefault()

    const trimmedName = projectName.trim()

    if (!trimmedName) {
      setFeedback({ type: 'error', message: 'Please enter a project name before creating it.' })
      return
    }

    setIsSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      const res = await axiosInstance.post('/projects/create', {
        name: trimmedName,
      })

      setFeedback({ type: 'success', message: res?.data?.message || 'Project created successfully.' })
      closeModal()
    } catch (error) {
      setFeedback({ type: 'error', message: extractApiErrorMessage(error, 'We could not create your project right now. Please try again.') })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6'>
        <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:p-8'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
            <div className='max-w-2xl'>
              <p className='inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300'>
                <i className='ri-dashboard-line mr-2'></i>
                Workspace overview
              </p>
              <h1 className='mt-4 text-3xl font-semibold tracking-tight sm:text-4xl'>
                Welcome back, {user?.email?.split('@')[0] || 'developer'}.
              </h1>
              <p className='mt-3 text-sm leading-6 text-slate-400 sm:text-base'>
                Build clarity around your ideas, keep collaborators aligned, and launch projects with a calmer workflow.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className='inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30'>
              <i className='ri-add-line mr-2 text-lg'></i>
              New Project
            </button>
          </div>
        </section>

        {feedback.message && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
            : 'border-red-500/30 bg-red-500/10 text-red-200'}`}>
            {feedback.message}
          </div>
        )}

        <section className='grid gap-6 lg:grid-cols-[1.4fr_0.8fr]'>
          <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl sm:p-8'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-slate-400'>Projects</p>
                <h2 className='mt-2 text-2xl font-semibold'>Your team workspace</h2>
              </div>
            </div>

            <div className='mt-6 rounded-2xl border border-dashed border-cyan-400/30 bg-slate-950/40 p-8 text-center'>
              <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300'>
                <i className='ri-folder-2-line text-2xl'></i>
              </div>
              <h3 className='mt-4 text-xl font-semibold'>No projects yet</h3>
              <p className='mt-2 text-sm leading-6 text-slate-400'>
                Create your first project to start organizing ideas, tasks, and collaboration in one place.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className='mt-6 inline-flex items-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20'>
                <i className='ri-add-circle-line mr-2'></i>
                Create your first project
              </button>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl'>
              <p className='text-sm uppercase tracking-[0.3em] text-slate-400'>Tips</p>
              <ul className='mt-4 space-y-3 text-sm leading-6 text-slate-300'>
                <li><span className='mr-2 text-cyan-300'>•</span>Keep project names short and descriptive.</li>
                <li><span className='mr-2 text-cyan-300'>•</span>Use the workspace to centralize work and updates.</li>
                <li><span className='mr-2 text-cyan-300'>•</span>Invite teammates once the first project is live.</li>
              </ul>
            </div>

            <div className='rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl'>
              <p className='text-sm uppercase tracking-[0.3em] text-slate-400'>Quick actions</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className='mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20'>
                <i className='ri-add-box-line mr-2'></i>
                Start a new project
              </button>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6'>
          <div className='w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:p-8'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-cyan-400'>Create project</p>
                <h2 className='mt-2 text-2xl font-semibold'>Start a new workspace</h2>
              </div>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-full border border-white/10 bg-white/10 p-2 text-slate-300 transition hover:bg-white/20'>
                <i className='ri-close-line text-lg'></i>
              </button>
            </div>

            <form onSubmit={createProject} className='mt-6 space-y-5'>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-300'>Project name</label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type='text'
                  placeholder='e.g. AI dashboard'
                  className='w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                />
              </div>

              <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/20'>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70'>
                  {isSubmitting ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home