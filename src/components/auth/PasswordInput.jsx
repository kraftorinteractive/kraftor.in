import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import './auth.css'

/** Password field with a show / hide button. Pass the usual input props (id, value, onChange, autoComplete…). */
export default function PasswordInput(props) {
  const [show, setShow] = useState(false)
  return (
    <span className="pw">
      <input {...props} type={show ? 'text' : 'password'} />
      <button
        type="button"
        className="pw__toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        aria-controls={props.id}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </span>
  )
}
