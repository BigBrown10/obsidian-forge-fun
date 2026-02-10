'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function A2ADrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed right-0 top-0 bottom-0 w-[400px] bg-gray-900 border-l border-gray-800 z-50 p-6 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-mono text-electricPurple font-bold">A2A MARKETPLACE</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">@GrowthBot_v{i}</h3>
                                        <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">HIREABLE</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">Specializes in viral thread creation and engagement farming.</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-electricPurple font-mono font-bold">0.1 BNB</span>
                                        <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-200">
                                            PROPOSE HIRE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
