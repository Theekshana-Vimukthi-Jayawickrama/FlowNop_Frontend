import React from 'react';
import { useTasks } from '../features/tasks/useTasks';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import { LayoutDashboard, CheckSquare, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Query all tasks (up to 50 tasks for analytics) scoped by role on backend
  const { data, isLoading, isError } = useTasks({
    limit: 50,
    approved: 'all',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-surface border border-border-color rounded-2xl max-w-md mx-auto shadow-sm">
        <AlertCircle className="w-10 h-10 text-danger mb-4 shrink-0" />
        <h2 className="text-lg font-bold text-text-main mb-2 select-none">Error Loading Dashboard</h2>
        <p className="text-sm text-text-muted mb-6">Failed to retrieve task data. Please try again later.</p>
      </div>
    );
  }

  const tasks = data?.data || [];
  const totalTasks = tasks.length;

  // Status metrics
  const openTasks = tasks.filter((t) => t.status === 'open');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const testingTasks = tasks.filter((t) => t.status === 'testing');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  // Priority metrics
  const highTasks = tasks.filter((t) => t.priority === 'high');
  const mediumTasks = tasks.filter((t) => t.priority === 'medium');
  const lowTasks = tasks.filter((t) => t.priority === 'low');

  // Status Distribution Percentages
  const openPercent = totalTasks ? Math.round((openTasks.length / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0;
  const testingPercent = totalTasks ? Math.round((testingTasks.length / totalTasks) * 100) : 0;
  const donePercent = totalTasks ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // Cards layout configuration
  const statusCards = [
    {
      title: 'Open',
      count: openTasks.length,
      percent: openPercent,
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20',
      barColor: 'bg-blue-500 dark:bg-blue-400',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: 'In Progress',
      count: inProgressTasks.length,
      percent: inProgressPercent,
      colorClass: 'text-warning bg-warning/10 border-warning/20',
      barColor: 'bg-warning',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Testing',
      count: testingTasks.length,
      percent: testingPercent,
      colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20 dark:text-purple-400 dark:bg-purple-400/10 dark:border-purple-400/20',
      barColor: 'bg-purple-500 dark:bg-purple-400',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      title: 'Completed',
      count: doneTasks.length,
      percent: donePercent,
      colorClass: 'text-success bg-success/10 border-success/20',
      barColor: 'bg-success',
      icon: <CheckSquare className="w-5 h-5" />,
    },
  ];

  // SVG Custom Donut geometry setup
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  // Theme-aware SVG Donut Segments
  const donutSegments = [
    { name: 'Open', count: openTasks.length, percent: openPercent, color: '#3b82f6' }, // blue-500
    { name: 'In Progress', count: inProgressTasks.length, percent: inProgressPercent, color: 'var(--warning)' }, // warning theme token
    { name: 'Testing', count: testingTasks.length, percent: testingPercent, color: '#a855f7' }, // purple-500
    { name: 'Completed', count: doneTasks.length, percent: donePercent, color: 'var(--success)' }, // success theme token
  ].filter(seg => seg.count > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Upper header */}
      <div>
        <h1 className="text-2xl font-black text-text-main leading-tight flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          Dashboard Overview
        </h1>
        <p className="text-xs text-text-muted mt-1 font-semibold select-none">
          {user?.role === 'admin' 
            ? 'Unified system metrics and workspace performance analytics.' 
            : 'Personal task distribution and progress tracking.'}
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card) => (
          <Card key={card.title} className="p-5 border-border-color shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase select-none">{card.title}</span>
                <h2 className="text-3xl font-black text-text-main mt-1 tracking-tight">{card.count}</h2>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center justify-center ${card.colorClass}`}>
                {card.icon}
              </div>
            </div>
            
            {/* Distribution metrics */}
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1 select-none">
                <span>Distribution</span>
                <span>{card.percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-background border border-border-color/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${card.barColor} transition-all duration-500`}
                  style={{ width: `${card.percent}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Donut Card */}
        <Card className="p-6 border-border-color shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider select-none mb-6">Task Status Distribution</h3>
            {totalTasks === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[220px] text-xs font-bold text-text-muted italic select-none">
                No tasks available to analyze.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-8 py-4">
                {/* SVG Donut element */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      className="stroke-background" 
                      strokeWidth="14" 
                      fill="transparent" 
                    />
                    {donutSegments.map((seg) => {
                      const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                      accumulatedPercent += seg.percent;
                      return (
                        <circle
                          key={seg.name}
                          cx="60"
                          cy="60"
                          r={radius}
                          stroke={seg.color}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          fill="transparent"
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                    <span className="text-3xl font-black text-text-main leading-none">{totalTasks}</span>
                    <span className="text-[10px] font-bold text-text-muted uppercase mt-1">Total Tasks</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex flex-col gap-3">
                  {donutSegments.map((seg) => (
                    <div key={seg.name} className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-xs font-bold text-text-main w-20">{seg.name}</span>
                      <span className="text-xs font-bold text-text-muted">{seg.count} ({seg.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Priority Analytics Card */}
        <Card className="p-6 border-border-color shadow-sm">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider select-none mb-6">Task Priority Distribution</h3>
          {totalTasks === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] text-xs font-bold text-text-muted italic select-none">
              No tasks available to analyze.
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-4">
              {[
                { name: 'High Priority', count: highTasks.length, color: 'bg-danger', text: 'text-danger' },
                { name: 'Medium Priority', count: mediumTasks.length, color: 'bg-warning', text: 'text-warning' },
                { name: 'Low Priority', count: lowTasks.length, color: 'bg-primary', text: 'text-primary' },
              ].map((prio) => {
                const percent = totalTasks ? Math.round((prio.count / totalTasks) * 100) : 0;
                return (
                  <div key={prio.name} className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold select-none">
                      <span className="text-text-main">{prio.name}</span>
                      <span className={prio.text}>{prio.count} ({percent}%)</span>
                    </div>
                    <div className="h-5 w-full bg-background border border-border-color/30 rounded-lg overflow-hidden flex">
                      <div 
                        className={`h-full ${prio.color} transition-all duration-500 rounded-r-md`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
