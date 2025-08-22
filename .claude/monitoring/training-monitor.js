#!/usr/bin/env node

/**
 * Context7 Training Monitoring System
 * Automated tracking and alerting for team training progress
 * 
 * Development Manager - Training Coordination System
 * Version: 1.0
 * Date: 2025-08-22
 */

const fs = require('fs');
const path = require('path');

class Context7TrainingMonitor {
    constructor() {
        this.dashboardPath = path.join(__dirname, 'context7-dashboard.json');
        this.logPath = path.join(__dirname, 'monitoring.log');
        this.alertThresholds = {
            noUsage: 2, // days
            criticalNoUsage: 3, // days
            lowConsistency: 0.8, // 80%
            teamAdoptionThreshold: 0.8 // 80%
        };
    }

    /**
     * Load current dashboard data
     */
    loadDashboard() {
        try {
            const data = fs.readFileSync(this.dashboardPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            this.log('ERROR', `Failed to load dashboard: ${error.message}`);
            return null;
        }
    }

    /**
     * Save dashboard data
     */
    saveDashboard(data) {
        try {
            fs.writeFileSync(this.dashboardPath, JSON.stringify(data, null, 2));
            this.log('INFO', 'Dashboard data saved successfully');
            return true;
        } catch (error) {
            this.log('ERROR', `Failed to save dashboard: ${error.message}`);
            return false;
        }
    }

    /**
     * Log events with timestamp
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        console.log(logEntry.trim());
        
        try {
            fs.appendFileSync(this.logPath, logEntry);
        } catch (error) {
            console.error(`Failed to write to log file: ${error.message}`);
        }
    }

    /**
     * Record a Context7 query event
     */
    recordQuery(developerId, libraryName, topic, success = true) {
        const dashboard = this.loadDashboard();
        if (!dashboard) return false;

        const developer = dashboard.context7_training_dashboard.individual_progress.developers
            .find(dev => dev.id === developerId);

        if (!developer) {
            this.log('ERROR', `Developer not found: ${developerId}`);
            return false;
        }

        // Record the query
        const queryEvent = {
            timestamp: new Date().toISOString(),
            library: libraryName,
            topic: topic,
            success: success
        };

        developer.daily_tracking.context7_queries.push(queryEvent);

        // Update library usage tracking
        if (dashboard.context7_training_dashboard.library_usage_tracking[libraryName]) {
            dashboard.context7_training_dashboard.library_usage_tracking[libraryName].query_count++;
            if (success) {
                const libData = dashboard.context7_training_dashboard.library_usage_tracking[libraryName];
                libData.success_rate = (libData.success_rate * (libData.query_count - 1) + 1) / libData.query_count;
            }
        }

        this.saveDashboard(dashboard);
        this.log('INFO', `Query recorded for ${developerId}: ${libraryName}/${topic} (${success ? 'success' : 'failed'})`);
        return true;
    }

    /**
     * Update quality gate status
     */
    updateQualityGate(developerId, gateNumber, status, score = null) {
        const dashboard = this.loadDashboard();
        if (!dashboard) return false;

        const developer = dashboard.context7_training_dashboard.individual_progress.developers
            .find(dev => dev.id === developerId);

        if (!developer) {
            this.log('ERROR', `Developer not found: ${developerId}`);
            return false;
        }

        const gateKeys = ['gate1_knowledge', 'gate2_practical', 'gate3_integration', 'gate4_certification'];
        const gateKey = gateKeys[gateNumber - 1];

        if (!gateKey) {
            this.log('ERROR', `Invalid gate number: ${gateNumber}`);
            return false;
        }

        developer.quality_gates[gateKey].status = status;
        developer.quality_gates[gateKey].completion_date = new Date().toISOString();
        
        if (score !== null) {
            developer.quality_gates[gateKey].score = score;
        }

        this.saveDashboard(dashboard);
        this.log('INFO', `Quality Gate ${gateNumber} updated for ${developerId}: ${status} (Score: ${score})`);
        return true;
    }

    /**
     * Check for alerts and escalations
     */
    checkAlerts() {
        const dashboard = this.loadDashboard();
        if (!dashboard) return [];

        const alerts = [];
        const now = new Date();

        dashboard.context7_training_dashboard.individual_progress.developers.forEach(developer => {
            const lastQueryDate = this.getLastQueryDate(developer);
            const daysSinceLastQuery = lastQueryDate ? 
                Math.floor((now - lastQueryDate) / (1000 * 60 * 60 * 24)) : 999;

            // Check usage alerts
            if (daysSinceLastQuery >= this.alertThresholds.criticalNoUsage) {
                alerts.push({
                    type: 'CRITICAL',
                    developerId: developer.id,
                    developerName: developer.name,
                    message: `No Context7 usage for ${daysSinceLastQuery} days`,
                    action: 'IMMEDIATE_INTERVENTION_REQUIRED'
                });
                developer.alert_status = 'red';
            } else if (daysSinceLastQuery >= this.alertThresholds.noUsage) {
                alerts.push({
                    type: 'WARNING',
                    developerId: developer.id,
                    developerName: developer.name,
                    message: `No Context7 usage for ${daysSinceLastQuery} days`,
                    action: 'SCHEDULE_CHECKIN'
                });
                developer.alert_status = 'yellow';
            } else {
                developer.alert_status = 'green';
            }

            // Check quality gate progress
            const targetDate = new Date(developer.start_date);
            targetDate.setDate(targetDate.getDate() + 14); // 2 week completion target

            if (now > targetDate) {
                const gatesCompleted = Object.values(developer.quality_gates)
                    .filter(gate => gate.status === 'passed').length;
                
                if (gatesCompleted < 4) {
                    alerts.push({
                        type: 'OVERDUE',
                        developerId: developer.id,
                        developerName: developer.name,
                        message: `Training overdue: ${gatesCompleted}/4 gates completed`,
                        action: 'PERFORMANCE_IMPROVEMENT_PLAN'
                    });
                }
            }
        });

        // Update alerts in dashboard
        dashboard.context7_training_dashboard.alerts_and_escalations.active_alerts = alerts;
        this.saveDashboard(dashboard);

        if (alerts.length > 0) {
            this.log('ALERT', `${alerts.length} alerts generated`);
            alerts.forEach(alert => {
                this.log('ALERT', `${alert.type}: ${alert.developerName} - ${alert.message}`);
            });
        }

        return alerts;
    }

    /**
     * Get last query date for a developer
     */
    getLastQueryDate(developer) {
        const queries = developer.daily_tracking.context7_queries;
        if (queries.length === 0) return null;

        const lastQuery = queries[queries.length - 1];
        return new Date(lastQuery.timestamp);
    }

    /**
     * Generate weekly progress report
     */
    generateWeeklyReport() {
        const dashboard = this.loadDashboard();
        if (!dashboard) return null;

        const report = {
            generated_date: new Date().toISOString(),
            week_ending: new Date().toISOString(),
            summary: {
                total_developers: dashboard.context7_training_dashboard.individual_progress.developers.length,
                certified_developers: 0,
                in_progress_developers: 0,
                at_risk_developers: 0,
                total_queries: 0,
                average_competency_score: 0
            },
            developer_details: [],
            library_usage: dashboard.context7_training_dashboard.library_usage_tracking,
            recommendations: []
        };

        let totalScores = 0;
        let scoreCount = 0;

        dashboard.context7_training_dashboard.individual_progress.developers.forEach(developer => {
            const gatesCompleted = Object.values(developer.quality_gates)
                .filter(gate => gate.status === 'passed').length;
            
            const status = gatesCompleted === 4 ? 'certified' : 
                          developer.alert_status === 'red' ? 'at_risk' : 'in_progress';

            report.summary[`${status}_developers`]++;
            report.summary.total_queries += developer.daily_tracking.context7_queries.length;

            // Calculate average score from completed gates
            Object.values(developer.quality_gates).forEach(gate => {
                if (gate.score !== null) {
                    totalScores += gate.score;
                    scoreCount++;
                }
            });

            report.developer_details.push({
                name: developer.name,
                role: developer.role,
                status: status,
                gates_completed: gatesCompleted,
                queries_this_week: developer.daily_tracking.context7_queries.length,
                alert_status: developer.alert_status
            });
        });

        report.summary.average_competency_score = scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0;

        // Generate recommendations
        if (report.summary.at_risk_developers > 0) {
            report.recommendations.push(`${report.summary.at_risk_developers} developers require immediate intervention`);
        }
        
        if (report.summary.average_competency_score < 85) {
            report.recommendations.push('Team average competency below target - review training materials');
        }

        if (report.summary.total_queries < report.summary.total_developers * 7) {
            report.recommendations.push('Low query frequency - encourage daily Context7 usage');
        }

        // Save report
        dashboard.context7_training_dashboard.weekly_reports.reports.push(report);
        this.saveDashboard(dashboard);

        this.log('INFO', 'Weekly report generated');
        return report;
    }

    /**
     * Calculate team metrics
     */
    updateTeamMetrics() {
        const dashboard = this.loadDashboard();
        if (!dashboard) return false;

        const developers = dashboard.context7_training_dashboard.individual_progress.developers;
        const totalDevelopers = developers.length;

        // Calculate completion rate
        const certifiedDevelopers = developers.filter(dev => 
            Object.values(dev.quality_gates).every(gate => gate.status === 'passed')
        ).length;

        const completionRate = totalDevelopers > 0 ? certifiedDevelopers / totalDevelopers : 0;

        // Calculate average competency score
        let totalScores = 0;
        let scoreCount = 0;
        developers.forEach(dev => {
            Object.values(dev.quality_gates).forEach(gate => {
                if (gate.score !== null) {
                    totalScores += gate.score;
                    scoreCount++;
                }
            });
        });

        const averageScore = scoreCount > 0 ? totalScores / scoreCount : 0;

        // Calculate daily usage frequency
        const totalQueries = developers.reduce((sum, dev) => 
            sum + dev.daily_tracking.context7_queries.length, 0
        );
        const dailyUsageFrequency = totalDevelopers > 0 ? totalQueries / (totalDevelopers * 14) : 0;

        // Update dashboard
        dashboard.context7_training_dashboard.team_metrics = {
            overall_completion_rate: Math.round(completionRate * 100) / 100,
            average_competency_score: Math.round(averageScore),
            daily_usage_frequency: Math.round(dailyUsageFrequency * 100) / 100,
            quality_improvement_index: 0, // To be updated based on code review data
            velocity_improvement_percentage: 0 // To be updated based on delivery metrics
        };

        this.saveDashboard(dashboard);
        this.log('INFO', 'Team metrics updated');
        return true;
    }

    /**
     * Main monitoring loop
     */
    runMonitoring() {
        this.log('INFO', 'Starting Context7 training monitoring cycle');

        // Check for alerts
        const alerts = this.checkAlerts();

        // Update team metrics
        this.updateTeamMetrics();

        // Generate weekly report if it's Friday
        const today = new Date();
        if (today.getDay() === 5) { // Friday
            this.generateWeeklyReport();
        }

        this.log('INFO', 'Monitoring cycle completed');
        return {
            alerts: alerts,
            timestamp: new Date().toISOString()
        };
    }
}

// CLI Interface
if (require.main === module) {
    const monitor = new Context7TrainingMonitor();
    const args = process.argv.slice(2);

    switch (args[0]) {
        case 'query':
            // Record a query: node training-monitor.js query dev001 hathora lobby-management true
            if (args.length >= 4) {
                const [_, developerId, library, topic, success] = args;
                monitor.recordQuery(developerId, library, topic, success === 'true');
            } else {
                console.log('Usage: node training-monitor.js query <developerId> <library> <topic> <success>');
            }
            break;

        case 'gate':
            // Update gate: node training-monitor.js gate dev001 1 passed 95
            if (args.length >= 4) {
                const [_, developerId, gateNumber, status, score] = args;
                monitor.updateQualityGate(developerId, parseInt(gateNumber), status, score ? parseInt(score) : null);
            } else {
                console.log('Usage: node training-monitor.js gate <developerId> <gateNumber> <status> [score]');
            }
            break;

        case 'alerts':
            const alerts = monitor.checkAlerts();
            console.log(JSON.stringify(alerts, null, 2));
            break;

        case 'report':
            const report = monitor.generateWeeklyReport();
            console.log(JSON.stringify(report, null, 2));
            break;

        case 'run':
        default:
            const result = monitor.runMonitoring();
            console.log(JSON.stringify(result, null, 2));
            break;
    }
}

module.exports = Context7TrainingMonitor;