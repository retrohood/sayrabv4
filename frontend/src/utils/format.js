export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getDaysRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

export const getVerificationLabel = (status) => {
  const labels = {
    pending_verification: 'Pending Verification',
    under_review: 'Under Review',
    verified: 'Verified',
    rejected: 'Rejected',
    emergency_verified: 'Emergency Verified',
  };
  return labels[status] || status;
};

export const isFundraiserUser = (user) => {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  return (
    role === 'fundraiser' ||
    role === 'manager' ||
    role === 'org_leader' ||
    Boolean(user.isVerifiedFundraiser)
  );
};
