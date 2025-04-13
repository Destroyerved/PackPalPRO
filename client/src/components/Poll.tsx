import React, { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';
import { Poll as PollType } from '@shared/schema';

interface PollProps {
  poll: PollType;
  userId: string;
  onVote: (optionId: string) => Promise<void>;
}

export function Poll({ poll, userId, onVote }: PollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already voted
    const userVote = poll.votes?.find(vote => vote.userId === userId);
    if (userVote) {
      setSelectedOption(userVote.optionId);
      setHasVoted(true);
    }
  }, [poll, userId]);

  const handleVote = async () => {
    if (!selectedOption) return;

    try {
      await onVote(selectedOption);
      setHasVoted(true);
      toast({
        title: 'Vote submitted',
        description: 'Your vote has been recorded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
    }
  };

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">{poll.question}</h3>
      
      {poll.status === 'closed' ? (
        <div className="space-y-4">
          {poll.options.map(option => {
            const percentage = totalVotes > 0 
              ? Math.round((option.votes / totalVotes) * 100) 
              : 0;
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{option.text}</span>
                  <span>{percentage}% ({option.votes} votes)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-sm text-gray-500 mt-2">
            Total votes: {totalVotes}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {poll.options.map(option => (
            <label
              key={option.id}
              className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="poll"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="form-radio h-4 w-4 text-blue-500"
                disabled={hasVoted}
              />
              <span>{option.text}</span>
            </label>
          ))}
          
          {!hasVoted && (
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              Vote
            </button>
          )}
          
          {hasVoted && (
            <p className="text-sm text-gray-500 text-center">
              You have already voted
            </p>
          )}
        </div>
      )}
    </div>
  );
} 