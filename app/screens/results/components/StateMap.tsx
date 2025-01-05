import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { STATE_PATHS } from '../constants';

const USVoteHeatMap = ({ votingData = {} }) => {
  // Function to calculate the percentage of option1 votes
  const getOption1Percentage = stateData => {
    if (!stateData || stateData.totalVotes === 0) return 0;
    return (stateData.option1_hash.votes / stateData.totalVotes) * 100;
  };

  // Function to get color based on voting percentage
  const getStateColor = stateData => {
    if (!stateData) return '#CCCCCC'; // Default gray for no data
    const option1Percentage = getOption1Percentage(stateData);
    // Create a gradient from red (0%) to blue (100%)
    const red = Math.floor((100 - option1Percentage) * 2.55);
    const blue = Math.floor(option1Percentage * 2.55);
    return `rgb(${red}, 0, ${blue})`;
  };

  // Function to format tooltip text
  const getTooltipText = (stateId, stateData) => {
    if (!stateData) return `${stateId}: No data`;
    const option1Percent = getOption1Percentage(stateData).toFixed(1);
    const option2Percent = (100 - getOption1Percentage(stateData)).toFixed(1);
    return `${stateId}:
${stateData.option1_hash.text}: ${option1Percent}% (${stateData.option1_hash.votes} votes)
${stateData.option2_hash.text}: ${option2Percent}% (${stateData.option2_hash.votes} votes)
Total votes: ${stateData.totalVotes}`;
  };

  // Get sample option text for legend (uses first state with data)
  const firstStateWithData = Object.values(votingData)[0];
  const option1Text = firstStateWithData?.option1_hash.text || 'Yes';
  const option2Text = firstStateWithData?.option2_hash.text || 'No';

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>US Voting Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full" style={{ paddingBottom: '45%' }}>
          <div className="absolute inset-0">
            <svg
              viewBox="400 450 700 250"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {Object.entries(STATE_PATHS).map(([stateId, pathData]) => (
                <path
                  key={stateId}
                  id={stateId}
                  d={pathData}
                  fill={getStateColor(votingData[stateId])}
                  className="cursor-pointer hover:opacity-80"
                  title={getTooltipText(stateId, votingData[stateId])}
                />
              ))}
            </svg>
          </div>
        </div>
        {/* Legend below the map */}
        <div className="flex justify-center space-x-8">
          <div className="flex items-center">
            <div
              className="w-4 h-4"
              style={{ backgroundColor: 'rgb(255, 0, 0)' }}
            ></div>
            <span className="ml-2 text-sm">100% {option2Text}</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4"
              style={{ backgroundColor: 'rgb(0, 0, 255)' }}
            ></div>
            <span className="ml-2 text-sm">100% {option1Text}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default USVoteHeatMap;
