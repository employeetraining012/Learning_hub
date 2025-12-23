import { SecurityGuard } from '@/components/layout/SecurityGuard'

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SecurityGuard>
      {children}
    </SecurityGuard>
  )
}
