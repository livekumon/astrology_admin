import { useCallback, useEffect, useState } from 'react'
import { fetchStats, fetchUserDetail, fetchUsers } from '../api/client'
import { useAdminAuth } from '../contexts/AdminAuthContext'

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0)
}

function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function formatDeviceType(value) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatLocation(location) {
  if (!location || location.latitude == null || location.longitude == null) return '—'
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
}

function locationMapsUrl(location) {
  if (!location || location.latitude == null || location.longitude == null) return null
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
}

export default function DashboardPage() {
  const { admin, logout } = useAdminAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, usersData] = await Promise.all([fetchStats(), fetchUsers()])
      setStats(statsData)
      setUsers(usersData.users || [])
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
      if (/auth|token|401|403/i.test(err.message)) logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function openUser(userId) {
    setSelectedUserId(userId)
    setDetailLoading(true)
    setUserDetail(null)
    try {
      const detail = await fetchUserDetail(userId)
      setUserDetail(detail)
    } catch (err) {
      setError(err.message || 'Failed to load user detail')
    } finally {
      setDetailLoading(false)
    }
  }

  function closeDetail() {
    setSelectedUserId(null)
    setUserDetail(null)
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Jyotish Admin</h1>
          <p>Signed in as {admin?.email}</p>
        </div>
        <button type="button" className="btn-ghost" onClick={logout}>
          Sign out
        </button>
      </header>

      {error && <p className="error-banner page-error">{error}</p>}

      {loading ? (
        <p className="muted">Loading dashboard…</p>
      ) : (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <span className="stat-label">Registered users</span>
              <strong className="stat-value">{formatNumber(stats?.userCount)}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Conversations</span>
              <strong className="stat-value">{formatNumber(stats?.conversationCount)}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Total tokens</span>
              <strong className="stat-value">{formatNumber(stats?.tokenUsage?.totalTokens)}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Total cost (INR)</span>
              <strong className="stat-value stat-value-cost">
                {formatInr(stats?.tokenUsage?.cost?.costInr ?? stats?.tokenUsage?.costInr)}
              </strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">LLM requests</span>
              <strong className="stat-value">{formatNumber(stats?.tokenUsage?.requestCount)}</strong>
            </article>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Users</h2>
              <button type="button" className="btn-ghost" onClick={loadDashboard}>
                Refresh
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Registered</th>
                    <th>Conversations</th>
                    <th>Total tokens</th>
                    <th>Cost (INR)</th>
                    <th>Requests</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={10} className="empty-cell">No users registered yet.</td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={String(user._id)}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{formatDeviceType(user.deviceType)}</td>
                      <td>{formatLocation(user.location)}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatNumber(user.conversationCount)}</td>
                      <td>{formatNumber(user.tokenUsage?.totalTokens)}</td>
                      <td>{formatInr(user.tokenUsage?.cost?.costInr ?? user.tokenUsage?.costInr)}</td>
                      <td>{formatNumber(user.tokenUsage?.requestCount)}</td>
                      <td>
                        <button type="button" className="btn-link" onClick={() => openUser(user._id)}>
                          View More Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedUserId && (
        <div className="drawer-backdrop" onClick={closeDetail}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>User detail</h2>
              <button type="button" className="btn-ghost" onClick={closeDetail}>Close</button>
            </div>

            {detailLoading && <p className="muted">Loading user…</p>}

            {userDetail && (
              <div className="drawer-body">
                <div className="detail-block">
                  <h3>{userDetail.user.name}</h3>
                  <p className="muted">{userDetail.user.email}</p>
                  <p>Language: {userDetail.user.language || 'en'}</p>
                  <p>Device: {formatDeviceType(userDetail.user.deviceType)}</p>
                  <p>
                    Location:{' '}
                    {locationMapsUrl(userDetail.user.location) ? (
                      <a
                        href={locationMapsUrl(userDetail.user.location)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-link"
                      >
                        {formatLocation(userDetail.user.location)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                  {userDetail.user.location?.accuracy != null && (
                    <p className="muted">Location accuracy: ±{Math.round(userDetail.user.location.accuracy)} m</p>
                  )}
                  {userDetail.user.deviceUpdatedAt && (
                    <p className="muted">Device updated: {formatDate(userDetail.user.deviceUpdatedAt)}</p>
                  )}
                  {userDetail.user.location?.updatedAt && (
                    <p className="muted">Location updated: {formatDate(userDetail.user.location.updatedAt)}</p>
                  )}
                  {userDetail.user.platform && (
                    <p className="muted">Platform: {userDetail.user.platform}</p>
                  )}
                  {userDetail.user.userAgent && (
                    <p className="muted device-agent">User agent: {userDetail.user.userAgent}</p>
                  )}
                  <p>Registered: {formatDate(userDetail.user.createdAt)}</p>
                </div>

                <div className="detail-block">
                  <h4>Token usage</h4>
                  <div className="mini-stats">
                    <span>Total: {formatNumber(userDetail.user.tokenUsage?.totalTokens)}</span>
                    <span>Cost: {formatInr(userDetail.user.tokenUsage?.cost?.costInr ?? userDetail.user.tokenUsage?.costInr)}</span>
                    <span>Prompt: {formatNumber(userDetail.user.tokenUsage?.promptTokens)}</span>
                    <span>Output: {formatNumber(userDetail.user.tokenUsage?.outputTokens)}</span>
                    <span>Thinking: {formatNumber(userDetail.user.tokenUsage?.thinkingTokens)}</span>
                  </div>
                  {userDetail.tokenBreakdown?.byTask?.length > 0 && (
                    <ul className="task-list">
                      {userDetail.tokenBreakdown.byTask.map((row) => (
                        <li key={row.task}>
                          <strong>{row.task}</strong>
                          <span>
                            {formatNumber(row.totalTokens)} tokens · {formatInr(row.cost?.costInr ?? row.costInr)} · {row.requestCount} req
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="detail-block">
                  <h4>Conversations ({userDetail.conversations?.length || 0})</h4>
                  {userDetail.conversations?.length === 0 && (
                    <p className="muted">No conversations yet.</p>
                  )}
                  <ul className="conv-list">
                    {userDetail.conversations?.map((conv) => (
                      <li key={String(conv._id)}>
                        <strong>{conv.name}</strong>
                        <span>{conv.chartData?.system || 'Unknown tradition'}</span>
                        <span>{formatNumber(conv.messageCount)} exchanges</span>
                        <span>
                          {formatNumber(conv.tokenUsage?.totalTokens)} tokens · {formatInr(conv.tokenUsage?.cost?.costInr ?? conv.tokenUsage?.costInr)}
                        </span>
                        <span className="muted">{formatDate(conv.updatedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {userDetail.tokenBreakdown?.recent?.length > 0 && (
                  <div className="detail-block">
                    <h4>Recent token events</h4>
                    <ul className="recent-list">
                      {userDetail.tokenBreakdown.recent.map((row) => (
                        <li key={String(row._id)}>
                          <span>{row.task} · {row.model}</span>
                          <span>
                            {formatNumber(row.totalTokens)} tokens · {formatInr(row.cost?.costInr ?? row.costInr)}
                          </span>
                          <span className="muted">{formatDate(row.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
