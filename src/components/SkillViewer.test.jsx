import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SkillViewer from './SkillViewer'

describe('SkillViewer', () => {
    it('switches between rendered, raw, and files tabs', async () => {
        const user = userEvent.setup()
        render(<SkillViewer markdownContent="# Skill\n\n`code`" rootName="demo" />)

        expect(screen.getByText(/Skill/)).toBeInTheDocument()

        await user.click(screen.getByRole('tab', { name: 'raw view' }))
        expect(screen.getByText(/# Skill/)).toBeInTheDocument()

        await user.click(screen.getByRole('tab', { name: 'files view' }))
        expect(screen.getByRole('button', { name: /demo.md/i })).toBeInTheDocument()
    })

    it('shows loading, error, and missing markdown fallback states', () => {
        const { rerender } = render(<SkillViewer loading markdownContent="" />)
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()

        rerender(<SkillViewer error="Failed markdown fetch" markdownContent="" />)
        expect(screen.getByText('Failed markdown fetch')).toBeInTheDocument()

        rerender(<SkillViewer markdownContent="" />)
        expect(screen.getByText(/No markdown content/i)).toBeInTheDocument()
    })

    it('keeps the active tab while switching files and ignores stale async responses', async () => {
        const user = userEvent.setup()
        let resolveFirst
        let resolveSecond
        const fetchFileContent = vi.fn((file) => new Promise((resolve) => {
            if (file.name === 'first.md') resolveFirst = resolve
            if (file.name === 'second.md') resolveSecond = resolve
        }))

        render(
            <SkillViewer
                markdownContent="# Main"
                rootName="demo"
                files={[
                    { name: 'first.md', path: 'first.md', type: 'file' },
                    { name: 'second.md', path: 'second.md', type: 'file' },
                ]}
                fetchFileContent={fetchFileContent}
            />
        )

        await user.click(screen.getByRole('tab', { name: 'files view' }))
        await user.click(screen.getByRole('button', { name: /first.md/i }))
        await user.click(screen.getByRole('tab', { name: 'files view' }))
        await user.click(screen.getByRole('button', { name: /second.md/i }))

        resolveSecond('second content')
        await waitFor(() => expect(screen.getByText('second content')).toBeInTheDocument())

        resolveFirst('first stale content')
        await waitFor(() => expect(screen.queryByText('first stale content')).not.toBeInTheDocument())
        expect(screen.getByRole('tab', { name: 'raw view' })).toHaveAttribute('aria-selected', 'true')
    })
})
