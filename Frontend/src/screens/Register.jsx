import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance, { extractApiErrorMessage } from "../config/axios";
import { UserContext } from "../context/User.context";

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { setUser } = useContext(UserContext)

    function submitHandler(e) {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        axiosInstance.post("/auth/register", {
            email,
            password
        })
            .then((res) => {
                setUser(res.data.user)
                navigate('/')
            })
            .catch((err) => {
                setError(extractApiErrorMessage(err, 'Registration failed. Please try again.'))
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4">
            {/* Background Blur */}
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-600/20 blur-[120px]" />

            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl shadow-lg shadow-cyan-500/30">
                        🚀
                    </div>

                    <h1 className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        DevRoom
                    </h1>

                    <p className="mt-3 text-center text-sm text-slate-400">
                        AI Powered Collaborative Coding Workspace
                    </p>
                </div>

                <form
                    onSubmit={submitHandler}
                    className="space-y-5">
                    {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Email
                        </label>

                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-white/10 bg-[#111827]/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex justify-between">
                            <label className="text-sm text-slate-300">
                                Password
                            </label>

                        </div>

                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-white/10 bg-[#111827]/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                        />
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>


                <p className="mt-8 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;