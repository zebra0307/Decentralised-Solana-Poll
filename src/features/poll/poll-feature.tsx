'use client'

import { useSolana } from '@/components/solana/use-solana'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Vote, Loader2 } from 'lucide-react'

export default function PollFeature() {
  const { account } = useSolana()
  const [view, setView] = useState<'list' | 'create'>('list')
  const [creating, setCreating] = useState(false)

  // Create Poll Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleCreatePoll = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a poll title')
      return
    }
    if (!description.trim()) {
      toast.error('Please enter a poll description')
      return
    }
    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options')
      return
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates')
      return
    }

    setCreating(true)
    try {
      // TODO: Implement with Anchor program
      toast.info('Poll creation coming soon!', {
        description: 'Integration with Solana program in progress',
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setOptions(['', ''])
      setStartDate('')
      setEndDate('')
    } catch (error: any) {
      console.error('Error creating poll:', error)
      toast.error('Failed to create poll', {
        description: error?.message || 'Unknown error',
      })
    } finally {
      setCreating(false)
    }
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Decentralized Polls</CardTitle>
          <CardDescription>Create and participate in on-chain polls</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your wallet to get started with creating and voting on polls
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Button onClick={() => setView(view === 'list' ? 'create' : 'list')}>
          {view === 'list' ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </>
          ) : (
            'View Polls'
          )}
        </Button>
      </div>

      {view === 'create' ? (
        /* Create Poll Form */
        <Card>
          <CardHeader>
            <CardTitle>Create New Poll</CardTitle>
            <CardDescription>Create a new on-chain poll for the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                placeholder="Enter poll title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter poll description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button size="sm" variant="outline" onClick={addOption} disabled={options.length >= 10}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={50}
                  />
                  {options.length > 2 && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleCreatePoll} disabled={creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Poll...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Poll
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Poll List - Coming Soon */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Vote className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Poll listing and voting coming soon!</p>
            <p className="text-sm text-muted-foreground text-center">
              The poll program is deployed at:{' '}
              <br />
              <span className="font-mono text-xs">F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
