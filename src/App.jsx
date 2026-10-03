import { useEffect, useState } from 'react'
import { Calculator, Keyboard, Sparkles, RotateCcw, CircleHelp } from 'lucide-react'

const buttonRows = [
  [
    { label: 'AC', type: 'clear' },
    { label: '±', type: 'sign' },
    { label: '%', type: 'percent' },
    { label: '÷', type: 'operator', value: '/' },
  ],
  [
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: '×', type: 'operator', value: '*' },
  ],
  [
    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '−', type: 'operator', value: '-' },
  ],
  [
    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '+', type: 'operator', value: '+' },
  ],
  [
    { label: '0', type: 'number', wide: true },
    { label: '.', type: 'decimal' },
    { label: '=', type: 'equals' },
  ],
]

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error'
  const rounded = Number.parseFloat(Number(value).toPrecision(12))
  return String(rounded)
}

function calculate(a, b, operator) {
  const first = Number(a)
  const second = Number(b)

  switch (operator) {
    case '+': return first + second
    case '-': return first - second
    case '*': return first * second
    case '/': return second === 0 ? null : first / second
    default: return second
  }
}

function Display({ expression, display, error }) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-[28px] border border-white/10 bg-black/25 p-5 sm:p-6">
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-purple-500/15 blur-3xl" />
      <p className="relative mb-2 min-h-5 truncate text-right text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        {error ? 'Calculation Error' : expression || 'Ready to calculate'}
      </p>
      <div
        className={`relative min-h-14 overflow-x-auto text-right text-4xl font-semibold tracking-tight sm:text-5xl ${
          error ? 'text-rose-300' : 'text-white'
        }`}
        aria-live="polite"
      >
        {error || display}
      </div>
    </div>
  )
}

function CalculatorButton({ button, onClick }) {
  const common =
    'button-pop flex min-h-[62px] items-center justify-center rounded-2xl border text-lg font-semibold transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400/60 active:translate-y-0 sm:min-h-[68px]'

  let style = 'border-white/8 bg-white/[0.055] text-slate-100 hover:bg-white/[0.10]'
  if (button.type === 'clear') {
    style = 'border-rose-300/10 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20'
  } else if (button.type === 'operator') {
    style = 'border-purple-300/10 bg-purple-400/15 text-purple-100 hover:bg-purple-400/25'
  } else if (button.type === 'equals') {
    style = 'border-transparent bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-950/40 hover:from-purple-400 hover:to-fuchsia-400'
  } else if (button.type === 'sign' || button.type === 'percent') {
    style = 'border-blue-300/10 bg-blue-400/10 text-blue-100 hover:bg-blue-400/20'
  }

  return (
    <button
      type="button"
      onClick={() => onClick(button)}
      aria-label={button.label}
      className={`${common} ${style} ${button.wide ? 'col-span-2' : ''}`}
    >
      {button.label}
    </button>
  )
}

function CalculatorCard() {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [expression, setExpression] = useState('')
  const [error, setError] = useState('')

  const reset = () => {
    setDisplay('0')
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(false)
    setExpression('')
    setError('')
  }

  const inputNumber = (number) => {
    setError('')
    if (waitingForOperand || display === 'Error') {
      setDisplay(number)
      setWaitingForOperand(false)
      return
    }

    setDisplay(display === '0' ? number : display + number)
  }

  const inputDecimal = () => {
    setError('')
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  const chooseOperator = (nextOperator) => {
    setError('')
    const inputValue = Number(display)

    if (storedValue === null) {
      setStoredValue(inputValue)
    } else if (operator && !waitingForOperand) {
      const result = calculate(storedValue, inputValue, operator)
      if (result === null) {
        setError('Cannot divide by zero')
        setDisplay('Error')
        setStoredValue(null)
        setOperator(null)
        return
      }
      setStoredValue(result)
      setDisplay(formatNumber(result))
    }

    setOperator(nextOperator)
    setWaitingForOperand(true)
    setExpression(`${display} ${nextOperator === '*' ? '×' : nextOperator === '/' ? '÷' : nextOperator === '-' ? '−' : '+'}`)
  }

  const equals = () => {
    if (operator === null || storedValue === null) return

    const inputValue = Number(display)
    const result = calculate(storedValue, inputValue, operator)

    if (result === null) {
      setError('Cannot divide by zero')
      setDisplay('Error')
      setStoredValue(null)
      setOperator(null)
      setExpression('')
      return
    }

    setExpression(`${formatNumber(storedValue)} ${operator === '*' ? '×' : operator === '/' ? '÷' : operator === '-' ? '−' : '+'} ${formatNumber(inputValue)} =`)
    setDisplay(formatNumber(result))
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  const toggleSign = () => {
    if (display === '0' || display === 'Error') return
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`)
  }

  const percent = () => {
    if (display === 'Error') return
    setDisplay(formatNumber(Number(display) / 100))
  }

  const handleButton = (button) => {
    if (button.type === 'number') inputNumber(button.label)
    if (button.type === 'decimal') inputDecimal()
    if (button.type === 'clear') reset()
    if (button.type === 'operator') chooseOperator(button.value)
    if (button.type === 'equals') equals()
    if (button.type === 'sign') toggleSign()
    if (button.type === 'percent') percent()
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key
      if (/^[0-9]$/.test(key)) {
        event.preventDefault()
        inputNumber(key)
      } else if (key === '.') {
        event.preventDefault()
        inputDecimal()
      } else if (['+', '-', '*', '/'].includes(key)) {
        event.preventDefault()
        chooseOperator(key)
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault()
        equals()
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault()
        reset()
      } else if (key === '%') {
        event.preventDefault()
        percent()
      } else if (key === 'Backspace') {
        event.preventDefault()
        if (!waitingForOperand && display !== 'Error') {
          setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [display, storedValue, operator, waitingForOperand])

  return (
    <section id="calculator" className="glass float relative w-full max-w-md rounded-[34px] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
            <Calculator size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Calculator</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Interactive mode</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
          aria-label="Reset calculator"
          title="Reset"
        >
          <RotateCcw size={17} />
        </button>
      </div>

      <Display expression={expression} display={display} error={error} />

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {buttonRows.flat().map((button, index) => (
          <CalculatorButton
            key={`${button.label}-${index}`}
            button={button}
            onClick={handleButton}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <Keyboard size={13} />
        <span>Keyboard supported</span>
      </div>
    </section>
  )
}

function UserGuide() {
  const steps = [
    ['01', 'Enter numbers', 'Click the number buttons to enter your value.'],
    ['02', 'Choose an operation', 'Select +, −, ×, or ÷ to perform a calculation.'],
    ['03', 'Get your result', 'Press = to calculate and display the result.'],
    ['04', 'Reset', 'Press AC to clear the current calculation.'],
  ]

  return (
    <section id="guide" className="mx-auto mt-20 w-full max-w-5xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-purple-300">User Guide</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How to use Chizu</h2>
        </div>
        <CircleHelp className="hidden text-purple-300/70 sm:block" size={34} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map(([number, title, description]) => (
          <div key={number} className="glass rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
            <span className="text-xs font-bold tracking-[0.2em] text-purple-300">{number}</span>
            <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-semibold text-white">Supported operations</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['+', 'Addition'],
              ['−', 'Subtraction'],
              ['×', 'Multiplication'],
              ['÷', 'Division'],
            ].map(([symbol, name]) => (
              <div key={name} className="rounded-2xl border border-white/7 bg-white/[0.035] p-4">
                <span className="text-xl font-bold text-purple-200">{symbol}</span>
                <p className="mt-1 text-xs text-slate-500">{name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-semibold text-white">Keyboard shortcuts</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ['0–9', 'Numbers'],
              ['+ − * /', 'Operators'],
              ['Enter / =', 'Calculate'],
              ['Esc / C', 'Clear'],
              ['Backspace', 'Delete last digit'],
            ].map(([key, action]) => (
              <div key={key} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-purple-200">{key}</kbd>
                <span className="text-slate-400">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  return (
    <main className="grid-pattern relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[10%] top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px] glow" />
      <div className="pointer-events-none absolute right-[5%] top-[35%] h-72 w-72 rounded-full bg-blue-500/10 blur-[110px] glow" />

      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-950/40">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-bold tracking-tight text-white">Chizu Calculator</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">React + Tailwind CSS</p>
          </div>
        </a>
        <a href="#guide" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
          User Guide
        </a>
      </nav>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-20 pt-8 sm:px-8 sm:pt-14">
        <header className="mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/10 bg-purple-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
            Simple • Smart • Responsive
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            Calculate with <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Chizu.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            A modern, responsive calculator built with React components, state management, event handling, and Tailwind CSS.
          </p>
        </header>

        <CalculatorCard />

        <UserGuide />

        <footer className="mt-16 flex flex-col items-center gap-2 text-center text-xs text-slate-600">
          <p>Chizu Calculator • Laboratory 1 • DCIT 26</p>
          <p>Built with React & Tailwind CSS</p>
        </footer>
      </div>
    </main>
  )
}

export default App