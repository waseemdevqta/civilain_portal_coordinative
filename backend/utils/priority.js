/**
 * Dynamic priority calculation for complaints.
 * Formula: score = (upvotes * 2) + daysSinceCreated
 *
 * Rules:
 *   score < 5   -> low
 *   5 - 15      -> medium
 *   16 - 30     -> high
 *   > 30        -> critical
 */

const calculatePriority = (complaint) => {
  const now = new Date();
  const createdAt = complaint && complaint.createdAt ? new Date(complaint.createdAt) : now;
  const diffTime = Math.max(0, now.getTime() - createdAt.getTime());
  const daysSinceCreated = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const upvotes = (complaint && typeof complaint.upvotes === 'number') ? complaint.upvotes : 0;
  const score = (upvotes * 2) + daysSinceCreated;

  let priority = 'low';
  if (score > 30) {
    priority = 'critical';
  } else if (score >= 16) {
    priority = 'high';
  } else if (score >= 5) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    priority,
    priorityScore: score,
  };
};

/**
 * Attaches dynamic priority and priorityScore to a complaint document or object.
 * @param {Object} complaintDoc - Mongoose document or plain JavaScript object
 * @returns {Object} Plain object with dynamic priority fields attached
 */
const attachPriority = (complaintDoc) => {
  if (!complaintDoc) return null;

  const complaintObj = typeof complaintDoc.toObject === 'function'
    ? complaintDoc.toObject()
    : { ...complaintDoc };

  const { priority, priorityScore } = calculatePriority(complaintObj);
  complaintObj.priority = priority;
  complaintObj.priorityScore = priorityScore;

  return complaintObj;
};

module.exports = {
  calculatePriority,
  attachPriority,
};
