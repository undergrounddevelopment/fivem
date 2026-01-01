import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModernFeatures } from '@/components/modern-features'

describe('ModernFeatures Component', () => {
  it('renders all feature cards', () => {
    render(<ModernFeatures />)
    
    expect(screen.getByText('Scripts')).toBeInTheDocument()
    expect(screen.getByText('MLO Maps')).toBeInTheDocument()
    expect(screen.getByText('Vehicles')).toBeInTheDocument()
    expect(screen.getByText('Clothing')).toBeInTheDocument()
  })

  it('displays correct descriptions', () => {
    render(<ModernFeatures />)
    
    expect(screen.getByText('5000+ Free Scripts')).toBeInTheDocument()
    expect(screen.getByText('Premium Interiors')).toBeInTheDocument()
  })

  it('has correct links', () => {
    render(<ModernFeatures />)
    
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
  })
})
