import {
  AdminShell,
  type AdminNavItem,
  Badge,
  Button,
  CatalogBadge,
  type ColumnDef,
  ConfirmAction,
  CopyButton,
  DataTable,
  EmptyState,
  FormDialog,
  FormField,
  Input,
  InsetList,
  LoadingButton,
  LocaleSwitcher,
  MetricStrip,
  Notice,
  PageHeader,
  PageSkeleton,
  type PageSkeletonVariant,
  Panel,
  PasswordInput,
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
  ShellSkeleton,
  SignInScreen,
  StatusDot,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Toaster,
  toast,
} from '@x0c/ui'
import {
  Activity,
  Inbox,
  KeyRound,
  Layers,
  Monitor,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { useState } from 'react'

const NAV: AdminNavItem[] = [
  { id: 'overview', label: 'Overview', icon: Activity, section: 'Workspace' },
  { id: 'placeholders', label: 'Placeholders', icon: Layers, section: 'Workspace' },
  { id: 'auth', label: 'Auth & Forms', icon: ShieldCheck, section: 'Security' },
]

const STATUS_CATALOG = [
  { code: 'active', label: 'Active', color: '#16794c' },
  { code: 'degraded', label: 'Degraded', color: '#a85d08' },
  { code: 'disabled', label: 'Disabled', color: '#666662' },
] as const

interface SampleRow {
  id: string
  name: string
  status: string
  endpoints: number
}

const SAMPLE_ROWS: SampleRow[] = Array.from({ length: 14 }, (_, idx) => ({
  id: `tenant-${idx + 1}`,
  name: idx === 0 ? 'acme-api' : idx === 1 ? 'billing-svc' : idx === 2 ? 'search-core' : `service-${idx + 1}`,
  status: idx % 4 === 3 ? 'disabled' : idx % 5 === 2 ? 'degraded' : 'active',
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
      cell: ({ row }) => <CatalogBadge source={STATUS_CATALOG} code={row.original.status} />,
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
  const [locale, setLocale] = useState('en')
  const [secret, setSecret] = useState<SecretReveal | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetRow, setSheetRow] = useState<SampleRow | null>(null)
  const [newName, setNewName] = useState('')
  const [password, setPassword] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [pending, setPending] = useState(false)
  const [simLoading, setSimLoading] = useState(false)
  const [skeletonVariant, setSkeletonVariant] = useState<PageSkeletonVariant>('overview')
  const [showShellPreview, setShowShellPreview] = useState(false)

  const applyTheme = (next: 'system' | 'light' | 'dark') => {
    setTheme(next)
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', next)
    }
  }

  if (showShellPreview) {
    return (
      <div className="relative">
        <ShellSkeleton variant={skeletonVariant} />
        <div className="fixed right-6 bottom-6 z-50">
          <Button size="sm" onClick={() => setShowShellPreview(false)}>
            Exit Shell Preview
          </Button>
        </div>
      </div>
    )
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
        {tab === 'overview' && (
          <>
            <PageHeader
              title="Flat Monochrome Console"
              actions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSimLoading((v) => !v)}
                  >
                    {simLoading ? 'Show Loaded' : 'Simulate Loading'}
                  </Button>
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
              loading={simLoading}
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
                data={simLoading ? [] : SAMPLE_ROWS}
                loading={simLoading}
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
          </>
        )}

        {tab === 'placeholders' && (
          <>
            <PageHeader
              title="Placeholders & States"
              actions={
                <Button variant="outline" size="sm" onClick={() => setShowShellPreview(true)}>
                  Preview ShellSkeleton
                </Button>
              }
            />

            <Tabs
              value={skeletonVariant}
              onValueChange={(v) => setSkeletonVariant(v as PageSkeletonVariant)}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="detail">Detail</TabsTrigger>
              </TabsList>
            </Tabs>

            <Panel title={`PageSkeleton (${skeletonVariant})`}>
              <PageSkeleton variant={skeletonVariant} />
            </Panel>

            <Panel title="EmptyState" flush>
              <EmptyState
                icon={<Inbox />}
                title="No webhooks configured"
                description="Add an endpoint to receive delivery receipts."
                action={<Button size="sm">Create endpoint</Button>}
              />
            </Panel>
          </>
        )}

        {tab === 'auth' && (
          <>
            <PageHeader
              title="Auth & Forms"
              actions={
                <LocaleSwitcher
                  value={locale}
                  onChange={setLocale}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'zh-CN', label: '简体中文' },
                  ]}
                />
              }
            />

            <Panel title="Password & Catalog Badges">
              <div className="grid max-w-md gap-4">
                <FormField label="Password" htmlFor="pg-password">
                  <PasswordInput
                    id="pg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </FormField>
                <div className="flex flex-wrap items-center gap-2">
                  <CatalogBadge source={STATUS_CATALOG} code="active" variant="pill" />
                  <CatalogBadge source={STATUS_CATALOG} code="degraded" variant="tinted" />
                  <CatalogBadge source={STATUS_CATALOG} code="unknown_enum_code" />
                </div>
              </div>
            </Panel>

            <Panel title="SignInScreen Preview" flush>
              <SignInScreen
                product="Console"
                ssoHref="#sso"
                onSsoClick={() => toast.info('SSO clicked')}
                localForm={
                  <FormField label="Token" htmlFor="pg-local-token">
                    <PasswordInput id="pg-local-token" placeholder="Paste admin token" />
                  </FormField>
                }
                className="min-h-[420px]"
              />
            </Panel>
          </>
        )}
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
