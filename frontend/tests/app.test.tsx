import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from '../src/routes/App'

describe('App', () => {
  it('renders GesundWerk title', () => {
    render(<App />)
    expect(screen.getByText(/GesundWerk/i)).toBeInTheDocument()
  })
})
