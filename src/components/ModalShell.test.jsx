import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ModalShell from './ModalShell'

function Harness({ onClose = vi.fn() }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>Open modal</button>
            {open && (
                <ModalShell
                    titleId="modal-title"
                    onClose={() => {
                        onClose()
                        setOpen(false)
                    }}
                    resizable={false}
                    contentClassName="p-4"
                >
                    <h2 id="modal-title">Skill modal</h2>
                    <button type="button">First action</button>
                    <button type="button">Last action</button>
                </ModalShell>
            )}
        </>
    )
}

describe('ModalShell', () => {
    it('exposes dialog semantics, traps focus, closes with Escape, and restores focus', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        render(<Harness onClose={onClose} />)

        const opener = screen.getByRole('button', { name: 'Open modal' })
        await user.click(opener)

        expect(screen.getByRole('dialog', { name: 'Skill modal' })).toHaveAttribute('aria-modal', 'true')
        expect(document.body.style.overflow).toBe('hidden')

        await user.tab()
        expect(screen.getByRole('button', { name: 'Last action' })).toHaveFocus()
        await user.tab()
        expect(screen.getByRole('button', { name: 'First action' })).toHaveFocus()

        await user.keyboard('{Escape}')
        expect(onClose).toHaveBeenCalled()
        expect(opener).toHaveFocus()
        expect(document.body.style.overflow).toBe('')
    })
})
