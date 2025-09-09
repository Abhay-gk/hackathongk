import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { TrainingResponse } from '../../models/dataset.model';

Chart.register(...registerables);

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header animate-fade-in">
      <h2>Model Training & Evaluation</h2>
      <div class="step-indicator">Step 3 of 4</div>
    </div>

    <!-- Before Training State -->
    <div *ngIf="!isTraining && !trainingResult" class="before-training animate-slide-up">
      <div class="empty-state">
        <div class="empty-icon">
          <mat-icon>psychology</mat-icon>
          <div class="icon-glow"></div>
        </div>
        <h3>Ready to Train Your Model</h3>
        <p>Click the button below to start training your machine learning model using the configured date ranges.</p>
        
        <button mat-raised-button color="primary" class="train-button" (click)="startTraining()">
          <mat-icon>play_arrow</mat-icon>
          Train Model
          <div class="button-shine"></div>
        </button>
      </div>
    </div>
    
    <!-- Training Progress -->
    <div *ngIf="isTraining" class="training-progress animate-fade-in">
      <div class="training-wrapper">
        <mat-spinner diameter="60" color="primary"></mat-spinner>
        <div class="training-pulse"></div>
      </div>
      <h3 class="training-text">Training Model...</h3>
      <p>Please wait while we train the XGBoost model on your data. This may take a few moments.</p>
      <div class="training-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <!-- After Training State -->
    <div *ngIf="trainingResult && !isTraining" class="after-training animate-slide-up">
      <!-- Success Message -->
      <div class="success-banner animate-scale-in">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <span>Model Trained Successfully</span>
        <div class="success-glow"></div>
      </div>
      
      <!-- Performance Metrics Cards -->
      <div class="metrics-section">
        <h3 class="animate-fade-in" style="animation-delay: 0.2s">Model Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card accuracy-card animate-scale-in" style="animation-delay: 0.3s">
            <div class="metric-value">{{(trainingResult.accuracy * 100).toFixed(1)}}%</div>
            <div class="metric-label">Accuracy</div>
            <div class="metric-shine"></div>
          </div>
          <div class="metric-card precision-card animate-scale-in" style="animation-delay: 0.4s">
            <div class="metric-value">{{(trainingResult.precision * 100).toFixed(1)}}%</div>
            <div class="metric-label">Precision</div>
            <div class="metric-shine"></div>
          </div>
          <div class="metric-card recall-card animate-scale-in" style="animation-delay: 0.5s">
            <div class="metric-value">{{(trainingResult.recall * 100).toFixed(1)}}%</div>
            <div class="metric-label">Recall</div>
            <div class="metric-shine"></div>
          </div>
          <div class="metric-card f1-card animate-scale-in" style="animation-delay: 0.6s">
            <div class="metric-value">{{(trainingResult.f1Score * 100).toFixed(1)}}%</div>
            <div class="metric-label">F1-Score</div>
            <div class="metric-shine"></div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Training Metrics Chart -->
        <div class="chart-container animate-scale-in" style="animation-delay: 0.7s">
          <h3 class="chart-title">
            <mat-icon>show_chart</mat-icon>
            Model Performance
          </h3>
          <div class="chart-subtitle">Training Metrics</div>
          <div class="chart-wrapper">
            <canvas baseChart
                    [data]="trainingChartData"
                    [options]="trainingChartOptions"
                    type="line">
            </canvas>
          </div>
          <div class="chart-glow"></div>
        </div>

        <!-- Confusion Matrix Donut Chart -->
        <div class="chart-container animate-scale-in" style="animation-delay: 0.8s" *ngIf="confusionMatrixData">
          <h3 class="chart-title">
            <mat-icon>donut_large</mat-icon>
            Model Performance
          </h3>
          <div class="chart-subtitle">Confusion Matrix</div>
          <div class="chart-wrapper">
            <canvas baseChart
                    [data]="confusionMatrixData"
                    [options]="confusionMatrixOptions"
                    type="doughnut">
            </canvas>
          </div>
          <div class="chart-glow"></div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="action-buttons animate-fade-in" style="animation-delay: 0.9s">
        <button mat-raised-button color="primary" class="next-button" (click)="nextStep()">
          Next
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Keyframe Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(30px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    @keyframes scaleIn {
      from { 
        opacity: 0; 
        transform: scale(0.8); 
      }
      to { 
        opacity: 1; 
        transform: scale(1); 
      }
    }

    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0);
      }
      40%, 43% {
        transform: translate3d(0, -8px, 0);
      }
      70% {
        transform: translate3d(0, -4px, 0);
      }
      90% {
        transform: translate3d(0, -2px, 0);
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.4;
      }
      100% {
        transform: scale(1);
        opacity: 0.8;
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes glow {
      0% {
        box-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(33, 150, 243, 0.6);
      }
      100% {
        box-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
      }
    }

    @keyframes loadingDots {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes successPulse {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.9;
      }
      100% {
        transform: scale(1);
        opacity: 0.7;
      }
    }

    /* Animation Classes */
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    .animate-slide-up {
      animation: slideUp 0.8s ease-out forwards;
    }

    .animate-scale-in {
      animation: scaleIn 0.5s ease-out forwards;
      opacity: 0;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-header h2 {
      font-size: 24px;
      font-weight: 500;
      color: #333;
      margin: 0;
      transition: all 0.3s ease;
    }

    .page-header h2:hover {
      color: #2196f3;
    }

    .step-indicator {
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .step-indicator::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .step-indicator:hover::before {
      left: 100%;
    }

    .step-indicator:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    }

    /* Before Training State */
    .before-training {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .empty-state {
      text-align: center;
      max-width: 500px;
      padding: 40px;
      position: relative;
    }

    .empty-icon {
      margin-bottom: 24px;
      position: relative;
      display: inline-block;
    }

    .empty-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #2196f3;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: bounce 2s infinite;
    }

    .icon-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(33, 150, 243, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-in-out infinite;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      transition: color 0.3s ease;
    }

    .empty-state p {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .train-button {
      font-size: 16px;
      font-weight: 500;
      padding: 12px 32px;
      border-radius: 25px;
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .train-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .train-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    }

    .train-button:hover::before {
      left: 100%;
    }

    .train-button mat-icon {
      margin-right: 8px;
      transition: transform 0.3s ease;
    }

    .train-button:hover mat-icon {
      transform: scale(1.1);
    }

    /* Training Progress */
    .training-progress {
      text-align: center;
      padding: 80px 40px;
      position: relative;
    }

    .training-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 24px;
    }

    .training-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      border: 2px solid rgba(33, 150, 243, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-in-out infinite;
    }
    
    .training-text {
      margin: 24px 0 12px 0;
      color: #333;
      font-size: 24px;
      font-weight: 500;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .training-progress p {
      color: #666;
      font-size: 16px;
      margin: 0 0 20px 0;
    }

    .training-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .training-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2196f3;
      animation: loadingDots 1.4s ease-in-out infinite both;
    }

    .training-dots span:nth-child(1) { animation-delay: -0.32s; }
    .training-dots span:nth-child(2) { animation-delay: -0.16s; }
    .training-dots span:nth-child(3) { animation-delay: 0s; }

    /* After Training */
    .after-training {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* Success Banner */
    .success-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
      color: #2e7d32;
      padding: 20px 24px;
      border-radius: 12px;
      margin-bottom: 32px;
      font-weight: 500;
      font-size: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    }

    .success-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 2s ease-in-out infinite;
    }

    .success-icon {
      color: #4caf50;
      margin-right: 12px;
      font-size: 24px;
      animation: bounce 1s ease;
    }

    .success-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: successPulse 3s ease-in-out infinite;
    }

    /* Metrics Section */
    .metrics-section {
      margin-bottom: 40px;
    }

    .metrics-section h3 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
      transition: color 0.3s ease;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .metric-card {
      background: white;
      padding: 32px 24px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .metric-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .accuracy-card {
      background: linear-gradient(135deg, #6a5acd 0%, #8a70d4 100%);
      color: white;
    }

    .accuracy-card:hover {
      background: linear-gradient(135deg, #7b6bd8 0%, #9b80de 100%);
    }

    .precision-card {
      background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
      color: white;
    }

    .precision-card:hover {
      background: linear-gradient(135deg, #ff7ba7 0%, #ff9fb5 100%);
    }

    .recall-card {
      background: linear-gradient(135deg, #4fc3f7 0%, #7dd3fc 100%);
      color: white;
    }

    .recall-card:hover {
      background: linear-gradient(135deg, #5fcdf8 0%, #8dddfd 100%);
    }

    .f1-card {
      background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
      color: white;
    }

    .f1-card:hover {
      background: linear-gradient(135deg, #76cb74 0%, #91d794 100%);
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    .metric-card:hover .metric-value {
      transform: scale(1.05);
    }
    
    .metric-label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s;
    }

    .metric-card:hover .metric-shine {
      left: 100%;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin: 40px 0;
    }
    
    .chart-container {
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      height: 300px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(33, 150, 243, 0.1);
    }

    .chart-container:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    .chart-wrapper {
      flex: 1;
      position: relative;
    }

    .chart-wrapper canvas {
      max-height: 220px;
    }

    .chart-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(33, 150, 243, 0.05) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.4s ease;
      pointer-events: none;
    }

    .chart-container:hover .chart-glow {
      width: 200px;
      height: 200px;
    }

    .chart-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0 0 4px 0;
      transition: color 0.3s ease;
    }

    .chart-container:hover .chart-title {
      color: #2196f3;
    }

    .chart-title mat-icon {
      margin-right: 8px;
      color: #666;
      font-size: 20px;
      transition: all 0.3s ease;
    }

    .chart-container:hover .chart-title mat-icon {
      color: #2196f3;
      transform: scale(1.1);
    }

    .chart-subtitle {
      font-size: 12px;
      color: #999;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: color 0.3s ease;
    }

    .chart-container:hover .chart-subtitle {
      color: #666;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 40px;
    }

    .next-button {
      font-size: 14px;
      font-weight: 500;
      padding: 12px 30px;
      border-radius: 25px;
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .next-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .next-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    }

    .next-button:hover::before {
      left: 100%;
    }

    .next-button mat-icon {
      margin-left: 8px;
      transition: transform 0.3s ease;
    }

    .next-button:hover mat-icon {
      transform: translateX(4px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .empty-state {
        padding: 20px;
      }

      .metric-card {
        padding: 24px 20px;
      }

      .chart-container {
        height: 280px;
      }
    }

    /* Reduced motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class TrainingComponent implements OnInit {
  datasetId!: number;
  isTraining = false;
  trainingResult: TrainingResponse | null = null;
  
  // Chart data
  trainingChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  trainingChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        }
      },
      x: {
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        },
        title: {
          display: true,
          text: 'Epochs',
          color: '#666'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#666'
        }
      }
    }
  };
  
  confusionMatrixData: ChartData<'doughnut'> | null = null;
  confusionMatrixOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#666',
          usePointStyle: true
        }
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.datasetId = Number(this.route.snapshot.paramMap.get('id'));
  }

  startTraining() {
    this.isTraining = true;
    this.trainingResult = null;

    this.apiService.trainModel(this.datasetId).subscribe({
      next: (result) => {
        this.trainingResult = result;
        this.isTraining = false;
        this.setupCharts();
      },
      error: (error) => {
        console.error('Training error:', error);
        this.snackBar.open('Training failed. Please try again.', 'Close', { duration: 5000 });
        this.isTraining = false;
      }
    });
  }

  setupCharts() {
    if (!this.trainingResult) return;

    // Setup training performance chart (simulated data)
    this.trainingChartData = {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      datasets: [
        {
          label: 'Training Accuracy',
          data: [0.65, 0.72, 0.78, 0.83, 0.87, 0.89, 0.91, 0.92, 0.925, this.trainingResult.accuracy],
          borderColor: '#4caf50',
          backgroundColor: 'transparent',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#4caf50',
          pointBorderColor: '#4caf50',
          pointRadius: 4
        },
        {
          label: 'Validation Loss',
          data: [0.45, 0.38, 0.32, 0.28, 0.25, 0.22, 0.20, 0.18, 0.16, 0.14],
          borderColor: '#f44336',
          backgroundColor: 'transparent',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#f44336',
          pointBorderColor: '#f44336',
          pointRadius: 4
        }
      ]
    };

    // Setup confusion matrix donut chart
    if (this.trainingResult.confusionMatrix && this.trainingResult.confusionMatrix.length > 0) {
      const matrix = this.trainingResult.confusionMatrix;
      // Calculate confusion matrix values
      const tp = matrix[1] ? matrix[1][1] || 0 : 0; // True Positive
      const tn = matrix[0] ? matrix[0][0] || 0 : 0; // True Negative
      const fp = matrix[0] ? matrix[0][1] || 0 : 0; // False Positive
      const fn = matrix[1] ? matrix[1][0] || 0 : 0; // False Negative

      this.confusionMatrixData = {
        labels: ['True Positive', 'True Negative', 'False Positive', 'False Negative'],
        datasets: [{
          data: [tp, tn, fp, fn],
          backgroundColor: [
            '#4caf50', // Green for True Positive
            '#2196f3', // Blue for True Negative  
            '#ff9800', // Orange for False Positive
            '#f44336'  // Red for False Negative
          ],
          borderWidth: 0
        }]
      };
    }
  }

  trainAnother() {
    this.trainingResult = null;
    this.isTraining = false;
  }

  goBack() {
    this.router.navigate(['/date-ranges', this.datasetId]);
  }

  nextStep() {
    this.router.navigate(['/simulation', this.datasetId]);
  }
}