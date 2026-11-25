import {
  AdminShell,
  type AdminNavItem,
  Badge,
  Button,
  type ColumnDef,
  ConfirmAction,
  CopyButton,
  DataTable,
  FormDialog,
  FormField,
  Input,
  InsetList,
  LoadingButton,
  MetricStrip,
  Notice,
  PageHeader,
  Panel,
  Row,
  RowIcon,
  SecretDialog,
  type SecretReveal,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  StatusDot,
  Switch,
  Toaster,
  toast,
} from '@x0c/ui'
import { Activity, KeyRound, Layers, Monitor, Moon, Plus, ScrollText, ShieldCheck, Sun } from 'lucide-react'
import { useState } from 'react'

const NAV: AdminNavItem[] = [
  { id: 'overview', label: 'Overview', icon: Activity, section: 'Workspace' },
  { id: 'tokens', label: 'Data & Forms', icon: Layers, section: 'Workspace' },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText, section: 'Security' },
]

interface SampleRow {
  id: string
  name: string
  status: string
  endpoints: number
}

const SAMPLE_ROWS: SampleRow[] = Array.from({ length: 14 }, (_, idx) => ({
  id: `tenant-${idx + 1}`,
  name: idx === 0 ? 'acme-api' : idx === 1 ? 'billing-svc' : idx === 2 ? 'search-core' : `service-${idx + 1}`,
  status: idx % 4 === 3 ? 'disabled' : 'active',
  endpoints: (idx + 1) * 3,
}))

function createSampleColumns(onInspect: (row: SampleRow) => void): ColumnDef<SampleRow, unknown>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusDot tone={row.original.status === 'active' ? 'success' : 'neutral'}>
          {row.original.status}
        </StatusDot>
      ),
    },
    {
      accessorKey: 'endpoints',
      header: 'Endpoints',
      cell: ({ row }) => <span className="font-mono text-xs tabular">{row.original.endpoints}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="ghost" size="xs" onClick={() => onInspect(row.original)}>
            Inspect
          </Button>
        </div>
      ),
    },
  ]
}

export function App() {
  const [tab, setTab] = useState('overview')
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')
  const [secret, setSecret] = useState<SecretReveal | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetRow, setSheetRow] = useState<SampleRow | null>(null)
  const [newName, setNewName] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [pending, setPending] = useState(false)

  const applyTheme = (next: 'system' | 'light' | 'dark') => {
    setTheme(next)
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', next)
    }
  }

  const columns = createSampleColumns(setSheetRow)

  return (
    <>
      <AdminShell
        product="UI Kit Playground"
        brandName="x0c"
        nav={NAV}
        activeId={tab}
        onSelectNav={setTab}
        enableCommandPalette
        user={{ email: 'alex@example.com', displayName: 'Alex Rivera' }}
        onSignOut={() => toast.info('Sign out clicked')}
        topbarActions={
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <Button
                key={mode}
                size="xs"
                variant={theme === mode ? 'default' : 'ghost'}
                onClick={() => applyTheme(mode)}
                aria-label={`Theme ${mode}`}
              >
                {mode === 'system' ? <Monitor /> : mode === 'light' ? <Sun /> : <Moon />}
              </Button>
            ))}
          </div>
        }
      >
        <PageHeader
          title="Flat Monochrome Console"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus />
                New Entity
              </Button>
              <LoadingButton
                size="sm"
                pending={pending}
                onClick={() => {
                  setPending(true)
                  setTimeout(() => {
                    setPending(false)
                    setSecret({
                      title: 'Example API Key',
                      items: [{ label: 'Secret Key', value: 'pc_live_example_1234567890abcdef' }],
                    })
                  }, 300)
                }}
              >
                Mint Secret
              </LoadingButton>
            </>
          }
        />

        <MetricStrip
          items={[
            { label: 'Tenants', value: 3 },
            { label: 'Apps', value: 4 },
            { label: 'Active Endpoints', value: 12 },
            { label: '24h Delivered', value: 4820 },
            { label: 'Delivery Rate', value: '99.9%' },
          ]}
          className="xl:grid-cols-5"
        />

        <div className="mb-5">
          <DataTable
            columns={columns}
            data={SAMPLE_ROWS}
            initialPageSize={5}
            pageSizeOptions={[5, 10, 20]}
            searchPlaceholder="Filter tenants…"
          />
        </div>

        <Panel title="Entities" action={<Badge variant="secondary">2 active</Badge>} flush>
          <InsetList className="rounded-none border-0">
            <Row
              icon={<RowIcon><ShieldCheck /></RowIcon>}
              title="acme-api"
              meta="Default tenant · com.example.acme"
              actions={
                <>
                  <StatusDot tone="success">Active</StatusDot>
                  <CopyButton value="acme-api" />
                </>
              }
            />
            <Row
              icon={<RowIcon><KeyRound /></RowIcon>}
              title="billing-svc"
              meta="2 client bundle IDs"
              actions={
                <ConfirmAction
                  trigger={<Button variant="outline" size="xs">Revoke</Button>}
                  title="Revoke credential?"
                  description="Services using this key will immediately stop authenticating."
                  confirmLabel="Revoke"
                  onConfirm={async () => {
                    toast.success('Revoked')
                  }}
                />
              }
            />
          </InsetList>
        </Panel>
      </AdminShell>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="New Entity"
        submitLabel="Create"
        onSubmit={() => {
          toast.success(`Created ${newName || 'entity'}`)
          setNewName('')
          setDialogOpen(false)
        }}
      >
        <Notice tone="info">Forms open in focused modals so tables stay uncluttered.</Notice>
        <FormField label="Name" htmlFor="pg-name" error={newName.length === 1 ? 'At least 2 chars' : undefined}>
          <Input id="pg-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="acme-api" />
        </FormField>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Enabled</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </FormDialog>

      <Sheet open={!!sheetRow} onOpenChange={(open) => !open && setSheetRow(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{sheetRow?.name}</SheetTitle>
            <SheetDescription>Inspect entity details inside a slide-over drawer.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <pre className="rounded-md border border-border bg-muted p-3 font-mono text-xs">
              {JSON.stringify(sheetRow, null, 2)}
            </pre>
          </SheetBody>
          <SheetFooter>
            <Button onClick={() => setSheetRow(null)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <SecretDialog secret={secret} onClose={() => setSecret(null)} />
      <Toaster />
    </>
  )
}
