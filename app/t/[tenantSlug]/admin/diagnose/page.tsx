import { diagnoseAssignments } from './debug-actions'
import { redirect } from 'next/navigation'

export default async function DiagnosticPage() {
    
    const runDiagnosis = async () => {
        'use server'
        // Check for employee "Phani" in tenant "ai-vision"
        await diagnoseAssignments('Phani', 'ai-vision')
        redirect('/t/ai-vision/admin/assignments')
    }
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Assignment Diagnostics</h1>
            <p className="mb-4">Click the button below to run diagnostics. Check your terminal for detailed output.</p>
            
            <form action={runDiagnosis}>
                <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Run Diagnosis for Phani
                </button>
            </form>
            
            <div className="mt-8 p-4 bg-gray-100 rounded">
                <h2 className="font-semibold mb-2">What this checks:</h2>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Course publication status (draft vs published)</li>
                    <li>Assignment rows existence for Phani</li>
                    <li>Tenant ID matching</li>
                    <li>Employee ID correctness</li>
                </ul>
            </div>
        </div>
    )
}
