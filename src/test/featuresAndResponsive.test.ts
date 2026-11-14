import { describe, it, expect } from 'vitest';
import { getSlaInfo, getDepartment, getPriority } from '@/lib/utils';
import { CATEGORY_SLA_HOURS, UNIVERSITY_INFO } from '@/lib/constants';

describe('CampusResolve Enterprise Features & SLA Verification', () => {
  it('correctly maps every category to its designated university division', () => {
    expect(getDepartment('Wi-Fi / Network')).toBe('Campus IT & Optical Fiber Division');
    expect(getDepartment('Water / Plumbing')).toBe('Estate Civil Works & Water Supply Cell');
    expect(getDepartment('Electrical')).toBe('Electrical Maintenance & Substation Division');
    expect(getDepartment('Classroom')).toBe('Academic AV & Infrastructure Facilities');
    expect(getDepartment('Hostel')).toBe('Hostel Wardens & Residential Office');
  });

  it('correctly assigns urgency priorities to categories', () => {
    expect(getPriority('Water / Plumbing')).toBe('critical');
    expect(getPriority('Wi-Fi / Network')).toBe('high');
    expect(getPriority('Electrical')).toBe('high');
    expect(getPriority('Cleanliness')).toBe('medium');
    expect(getPriority('Other')).toBe('low');
  });

  it('calculates SLA status accurately for active and resolved complaints', () => {
    const recentTime = new Date(Date.now() - 2 * 3600 * 1000).toISOString(); // 2 hours ago
    const activeSla = getSlaInfo(recentTime, 'Wi-Fi / Network', 'open');
    expect(activeSla.targetHours).toBe(CATEGORY_SLA_HOURS['Wi-Fi / Network']);
    expect(activeSla.isOverdue).toBe(false);
    expect(activeSla.remainingText).toContain('remaining');

    // Overdue complaint
    const oldTime = new Date(Date.now() - 48 * 3600 * 1000).toISOString(); // 48 hours ago
    const overdueSla = getSlaInfo(oldTime, 'Water / Plumbing', 'open'); // 8h SLA
    expect(overdueSla.isOverdue).toBe(true);
    expect(overdueSla.remainingText).toContain('Overdue');

    // Resolved within SLA
    const resolvedTime = new Date(new Date(recentTime).getTime() + 3 * 3600 * 1000).toISOString();
    const metSla = getSlaInfo(recentTime, 'Classroom', 'resolved', resolvedTime);
    expect(metSla.isOverdue).toBe(false);
    expect(metSla.remainingText).toContain('Met SLA');
  });

  it('includes verified institutional contact info and admin contact', () => {
    expect(UNIVERSITY_INFO.adminContact).toBe('harshitkulkarni608@gmail.com');
    expect(UNIVERSITY_INFO.portalName).toBe('CampusResolve');
    expect(UNIVERSITY_INFO.compliance).toContain('UGC');
  });
});
