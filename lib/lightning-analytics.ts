/**
 * BitAgora Lightning Analytics
 * 
 * Tracks Lightning Network payment events and metrics
 * Provides insights into payment success rates, performance, and user behavior
 * 
 * @version 1.0.0
 * @author BitAgora Development Team
 */

import { LIGHTNING_ANALYTICS_EVENTS } from './lightning-config'

// Analytics event types
interface BaseAnalyticsEvent {
  eventType: string
  timestamp: Date
  sessionId?: string
  userId?: string
}

interface InvoiceEvent extends BaseAnalyticsEvent {
  invoiceId: string
  amount: number
  currency: string
}

interface PaymentEvent extends BaseAnalyticsEvent {
  invoiceId: string
  amount: number
  duration?: number
  success: boolean
  errorCode?: string
  errorMessage?: string
}

interface PerformanceEvent extends BaseAnalyticsEvent {
  operation: string
  duration: number
  success: boolean
}

interface MetricsSnapshot {
  totalInvoices: number
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  totalVolume: number
  averageAmount: number
  averageCompletionTime: number
  successRate: number
  errorRates: Record<string, number>
  periodStart: Date
  periodEnd: Date
}

/**
 * Lightning Analytics Service
 * 
 * Collects and analyzes Lightning payment data
 */
export class LightningAnalytics {
  private static events: BaseAnalyticsEvent[] = []
  private static isEnabled: boolean = true
  private static maxEvents: number = 1000 // Keep last 1000 events in memory
  
  /**
   * Enable or disable analytics collection
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (enabled) {
      console.log('📊 Lightning analytics enabled')
    } else {
      console.log('📊 Lightning analytics disabled')
    }
  }

  /**
   * Track invoice generation
   */
  static trackInvoiceGenerated(
    invoiceId: string,
    amount: number,
    success: boolean,
    duration?: number
  ): void {
    if (!this.isEnabled) return

    const event: InvoiceEvent = {
      eventType: LIGHTNING_ANALYTICS_EVENTS.INVOICE_GENERATED,
      timestamp: new Date(),
      invoiceId,
      amount,
      currency: 'USD'
    }

    this.addEvent(event)
    
    // Track performance
    if (duration) {
      this.trackPerformance('invoice_generation', duration, success)
    }

    console.log(`📊 Invoice generated: ${invoiceId} ($${amount})`)
  }

  /**
   * Track payment completion
   */
  static trackPaymentCompleted(
    invoiceId: string,
    amount: number,
    duration: number
  ): void {
    if (!this.isEnabled) return

    const event: PaymentEvent = {
      eventType: LIGHTNING_ANALYTICS_EVENTS.PAYMENT_COMPLETED,
      timestamp: new Date(),
      invoiceId,
      amount,
      duration,
      success: true
    }

    this.addEvent(event)
    
    console.log(`📊 Payment completed: ${invoiceId} ($${amount}) in ${duration}ms`)
  }

  /**
   * Track payment failure
   */
  static trackPaymentFailed(
    invoiceId: string,
    amount: number,
    reason: string,
    errorCode?: string,
    duration?: number
  ): void {
    if (!this.isEnabled) return

    const event: PaymentEvent = {
      eventType: LIGHTNING_ANALYTICS_EVENTS.PAYMENT_FAILED,
      timestamp: new Date(),
      invoiceId,
      amount,
      duration,
      success: false,
      errorCode,
      errorMessage: reason
    }

    this.addEvent(event)
    
    console.log(`📊 Payment failed: ${invoiceId} - ${reason}`)
  }

  /**
   * Track invoice expiration
   */
  static trackInvoiceExpired(invoiceId: string, amount: number): void {
    if (!this.isEnabled) return

    const event: InvoiceEvent = {
      eventType: LIGHTNING_ANALYTICS_EVENTS.INVOICE_EXPIRED,
      timestamp: new Date(),
      invoiceId,
      amount,
      currency: 'USD'
    }

    this.addEvent(event)
    
    console.log(`📊 Invoice expired: ${invoiceId} ($${amount})`)
  }

  /**
   * Track API errors
   */
  static trackAPIError(
    operation: string,
    errorCode: string,
    errorMessage: string,
    duration?: number
  ): void {
    if (!this.isEnabled) return

    const event: BaseAnalyticsEvent = {
      eventType: LIGHTNING_ANALYTICS_EVENTS.API_ERROR,
      timestamp: new Date()
    }

    this.addEvent(event)
    
    if (duration) {
      this.trackPerformance(operation, duration, false)
    }

    console.log(`📊 API error: ${operation} - ${errorCode}: ${errorMessage}`)
  }

  /**
   * Track fallback usage
   */
  static trackFallbackUsed(reason: string, invoiceId?: string): void {
    if (!this.isEnabled) return

    const event: BaseAnalyticsEvent = {
      eventType: LIGHTNING_ANALYTICS_EVENTS.FALLBACK_USED,
      timestamp: new Date()
    }

    this.addEvent(event)
    
    console.log(`📊 Fallback used: ${reason} ${invoiceId ? `(${invoiceId})` : ''}`)
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(
    operation: string,
    duration: number,
    success: boolean
  ): void {
    if (!this.isEnabled) return

    const event: PerformanceEvent = {
      eventType: 'performance_metric',
      timestamp: new Date(),
      operation,
      duration,
      success
    }

    this.addEvent(event)
  }

  /**
   * Get analytics metrics for a time period
   */
  static getMetrics(
    startTime?: Date,
    endTime?: Date
  ): MetricsSnapshot {
    const start = startTime || new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    const end = endTime || new Date()
    
    const filteredEvents = this.events.filter(
      event => event.timestamp >= start && event.timestamp <= end
    )

    const invoiceEvents = filteredEvents.filter(
      event => event.eventType === LIGHTNING_ANALYTICS_EVENTS.INVOICE_GENERATED
    ) as InvoiceEvent[]

    const paymentEvents = filteredEvents.filter(
      event => event.eventType === LIGHTNING_ANALYTICS_EVENTS.PAYMENT_COMPLETED ||
               event.eventType === LIGHTNING_ANALYTICS_EVENTS.PAYMENT_FAILED
    ) as PaymentEvent[]

    const successfulPayments = paymentEvents.filter(event => event.success)
    const failedPayments = paymentEvents.filter(event => !event.success)

    const totalVolume = successfulPayments.reduce((sum, event) => sum + event.amount, 0)
    const averageAmount = successfulPayments.length > 0 ? totalVolume / successfulPayments.length : 0
    
    const completionTimes = successfulPayments
      .filter(event => event.duration)
      .map(event => event.duration!)
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0

    const successRate = paymentEvents.length > 0 
      ? (successfulPayments.length / paymentEvents.length) * 100 
      : 0

    // Calculate error rates
    const errorRates: Record<string, number> = {}
    failedPayments.forEach(event => {
      if (event.errorCode) {
        errorRates[event.errorCode] = (errorRates[event.errorCode] || 0) + 1
      }
    })

    return {
      totalInvoices: invoiceEvents.length,
      totalPayments: paymentEvents.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      totalVolume,
      averageAmount,
      averageCompletionTime,
      successRate,
      errorRates,
      periodStart: start,
      periodEnd: end
    }
  }

  /**
   * Get recent events
   */
  static getRecentEvents(limit: number = 50): BaseAnalyticsEvent[] {
    return this.events
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    invoiceGeneration: { average: number; success: number }
    paymentCompletion: { average: number; success: number }
  } {
    const performanceEvents = this.events.filter(
      event => event.eventType === 'performance_metric'
    ) as PerformanceEvent[]

    const invoiceGeneration = performanceEvents.filter(
      event => event.operation === 'invoice_generation'
    )
    
    const paymentCompletion = this.events.filter(
      event => event.eventType === LIGHTNING_ANALYTICS_EVENTS.PAYMENT_COMPLETED
    ) as PaymentEvent[]

    return {
      invoiceGeneration: {
        average: invoiceGeneration.length > 0 
          ? invoiceGeneration.reduce((sum, event) => sum + event.duration, 0) / invoiceGeneration.length 
          : 0,
        success: invoiceGeneration.filter(event => event.success).length
      },
      paymentCompletion: {
        average: paymentCompletion.length > 0 
          ? paymentCompletion
              .filter(event => event.duration)
              .reduce((sum, event) => sum + event.duration!, 0) / paymentCompletion.length
          : 0,
        success: paymentCompletion.length
      }
    }
  }

  /**
   * Export analytics data
   */
  static exportData(): {
    events: BaseAnalyticsEvent[]
    metrics: MetricsSnapshot
    performance: ReturnType<typeof LightningAnalytics.getPerformanceSummary>
  } {
    return {
      events: this.events,
      metrics: this.getMetrics(),
      performance: this.getPerformanceSummary()
    }
  }

  /**
   * Clear analytics data
   */
  static clearData(): void {
    this.events = []
    console.log('📊 Analytics data cleared')
  }

  /**
   * Add event to analytics
   */
  private static addEvent(event: BaseAnalyticsEvent): void {
    this.events.push(event)
    
    // Keep only the last N events to prevent memory issues
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  /**
   * Get analytics summary for logging
   */
  static logSummary(): void {
    if (!this.isEnabled) return

    const metrics = this.getMetrics()
    const performance = this.getPerformanceSummary()

    console.log('\n📊 Lightning Analytics Summary:')
    console.log(`   Total Invoices: ${metrics.totalInvoices}`)
    console.log(`   Total Payments: ${metrics.totalPayments}`)
    console.log(`   Success Rate: ${metrics.successRate.toFixed(1)}%`)
    console.log(`   Total Volume: $${metrics.totalVolume.toFixed(2)}`)
    console.log(`   Average Amount: $${metrics.averageAmount.toFixed(2)}`)
    console.log(`   Average Completion: ${metrics.averageCompletionTime.toFixed(0)}ms`)
    console.log(`   Invoice Generation: ${performance.invoiceGeneration.average.toFixed(0)}ms`)
    console.log(`   Events in Memory: ${this.events.length}`)
  }
}

// Export analytics instance
export default LightningAnalytics 