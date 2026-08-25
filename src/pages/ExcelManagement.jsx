import { useState } from 'react'
import { FiDownload, FiSettings, FiUploadCloud } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { exportSpreadsheet, importSpreadsheetRows } from '../api/excelApi.js'
import ExportCard from '../components/excel/ExportCard.jsx'
import ImportCard from '../components/excel/ImportCard.jsx'
import Toast from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { exportTypes, importTypes } from '../data/excelManagementData.js'

function ExcelManagement() {
  const { can } = useAuth()
  const [activeTab, setActiveTab] = useState('import')
  const [notice, setNotice] = useState(null)
  const [exporting, setExporting] = useState('')

  const availableImports = importTypes.filter((type) => type.disabled || can(type.module, 'create'))
  const availableExports = exportTypes.filter((type) => can(type.module, 'view'))

  const handleImport = async (type, rows, preview) => {
    const backendResult = await importSpreadsheetRows(type.id, rows)
    const invalidRows = new Set(preview.errors.map((error) => error.row)).size
    const result = {
      ...backendResult,
      totalRows: preview.totalRows,
      failed: backendResult.failed + invalidRows,
      errors: [...preview.errors, ...backendResult.errors],
    }
    const noticeType = result.failed === 0 ? 'success' : result.imported > 0 ? 'info' : 'error'
    setNotice({ type: noticeType, text: `${type.title}: ${result.imported} imported, ${result.skipped} skipped, ${result.failed} need attention.` })
    return result
  }

  const handleExport = async (type, dates) => {
    setExporting(type.id); setNotice(null)
    try {
      await exportSpreadsheet(type.id, dates)
      setNotice({ type: 'success', text: `${type.title} downloaded successfully.` })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
      throw error
    } finally { setExporting('') }
  }

  return <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
    <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">DATA MANAGEMENT</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Excel Import / Export</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiUploadCloud /></span></div><p className="mt-1 text-sm text-slate-500">Review, validate, and safely move restaurant data.</p></div><Link to="/settings" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600"><FiSettings /> Restaurant Settings</Link></div>
    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">Review your file before importing. Items already in the system will be skipped.</div>
    <nav className="mb-5 flex w-full max-w-md rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><button type="button" onClick={() => setActiveTab('import')} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${activeTab === 'import' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}><FiUploadCloud /> Import Data</button><button type="button" onClick={() => setActiveTab('export')} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${activeTab === 'export' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}><FiDownload /> Export Data</button></nav>
    {activeTab === 'import' && <section><div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Import Restaurant Data</h2><p className="mt-1 text-sm text-slate-500">Choose a file, preview valid rows, then confirm the import.</p></div><div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">{availableImports.map((type) => <ImportCard key={type.id} type={type} onImport={handleImport} />)}{!availableImports.length && <p className="text-sm text-slate-500">You do not have create permission for importable modules.</p>}</div></section>}
    {activeTab === 'export' && <section><div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Export Restaurant Data</h2><p className="mt-1 text-sm text-slate-500">Download your current restaurant information in an easy-to-read file.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">{availableExports.map((type) => <ExportCard key={type.id} type={type} onExport={handleExport} loading={exporting === type.id} />)}{!availableExports.length && <p className="text-sm text-slate-500">You do not have access to export this information.</p>}</div></section>}
  </div></main>
}

export default ExcelManagement
