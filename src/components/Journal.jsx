import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Journal({ session }) {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [coin, setCoin] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    getEntries()
  }, [session])

  const getEntries = async () => {
    try {
      setLoading(true)
      const { user } = session

      let { data, error, status } = await supabase
        .from('journal_entries')
        .select(`coin, amount, notes, created_at`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setEntries(data)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { user } = session
      const { error } = await supabase
        .from('journal_entries')
        .insert([{ user_id: user.id, coin, amount, notes }])

      if (error) {
        throw error
      }

      setCoin('')
      setAmount('')
      setNotes('')
      getEntries()
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if(error) {
        alert(error.message)
    }
  }

  return (
    <div className="form-widget">
      <div>
        <h1 className="header">Crypto Journal</h1>
        <p>Welcome, {session.user.email}</p>
        <button className="button block" onClick={signOut}>
          Sign Out
        </button>
      </div>
      <div>
        <form onSubmit={addEntry}>
          <h2>Add New Entry</h2>
          <div>
            <label htmlFor="coin">Coin</label>
            <input
              id="coin"
              type="text"
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              className="inputField"
              required
            />
          </div>
          <div>
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="inputField"
              required
            />
          </div>
          <div>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="inputField"
            />
          </div>
          <div>
            <button className="button block" disabled={loading}>
              {loading ? 'Saving ...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
      <div>
        <h2>Journal Entries</h2>
        {entries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <ul>
            {entries.map((entry, index) => (
              <li key={index}>
                <strong>{entry.coin}</strong>: {entry.amount} - {entry.notes} ({new Date(entry.created_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
