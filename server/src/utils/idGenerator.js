import Counter from '../models/Counter.js';

/**
 * Generates sequential event ID: EVT-YYYY-XXXX
 */
export async function getNextEventId() {
  const year = new Date().getFullYear();
  const counterName = `event_${year}`;
  
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(4, '0');
  return `EVT-${year}-${paddedSeq}`;
}

/**
 * Generates sequential case ID: KS-YYYY-XXXXXX
 */
export async function getNextCaseId() {
  const year = new Date().getFullYear();
  const counterName = `case_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(6, '0');
  return `KS-${year}-${paddedSeq}`;
}
