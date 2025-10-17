import React from 'react';

type Props = {
  summary: string;
  descriptionPlaintext: string;
  onSummaryChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
};

export default function Preview({ summary, descriptionPlaintext, onSummaryChange, onDescriptionChange }: Props) {
  return (
    <div className="preview">
      <div className="control" style={{ marginBottom: 8 }}>
        <label className="muted">Summary</label>
        <input
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Concise issue title"
        />
      </div>
      <div className="control">
        <label className="muted">Description</label>
        <textarea
          value={descriptionPlaintext}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={'Precondition:\nSteps:\nExpected:\nActual:'}
        />
      </div>
    </div>
  );
}


