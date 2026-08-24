function DangerZone({ title, description, children }) {
  return (
    <div className="mt-7 flex justify-end" role="group" aria-label={title} title={description}>
      <div className="inline-flex flex-wrap justify-end gap-2">{children}</div>
    </div>
  )
}

export default DangerZone
