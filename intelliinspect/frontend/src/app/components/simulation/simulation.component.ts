import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { SimulationRow } from '../../models/dataset.model';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header animate-fade-in">
      <h2>Real-Time Prediction Simulation</h2>
      <div class="step-indicator">Step 4 of 4</div>
    </div>

    <!-- Before Start State -->
    <div *ngIf="!hasStarted && !isLoading" class="before-start animate-slide-up">
      <!-- Start Button -->
      <div class="start-button-section">
        <button mat-raised-button color="primary" class="start-simulation-btn" (click)="startSimulation()">
          <mat-icon>play_arrow</mat-icon>
          Start Simulation
          <div class="button-shine"></div>
        </button>
        <p class="start-instruction">Click 'Start Simulation' to begin streaming predictions</p>
      </div>

      <!-- Empty Charts Placeholder -->
      <div class="charts-section">
        <div class="chart-container animate-scale-in" style="animation-delay: 0.2s">
          <h3 class="chart-title">
            <mat-icon>show_chart</mat-icon>
            Real Time Quality Predictions
          </h3>
          <div class="empty-chart">
            <canvas baseChart
                    [data]="emptyLineChartData"
                    [options]="lineChartOptions"
                    type="line">
            </canvas>
          </div>
          <div class="chart-glow"></div>
        </div>
        
        <div class="chart-container animate-scale-in" style="animation-delay: 0.3s">
          <h3 class="chart-title">
            <mat-icon>donut_large</mat-icon>
            Prediction Confidence
          </h3>
          <div class="empty-chart">
            <canvas baseChart
                    [data]="emptyDonutChartData"
                    [options]="donutChartOptions"
                    type="doughnut">
            </canvas>
          </div>
          <div class="chart-glow"></div>
        </div>
      </div>

      <!-- Empty Statistics -->
      <div class="statistics-section animate-scale-in" style="animation-delay: 0.4s">
        <h3>Live Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Total</div>
            <div class="stat-shine"></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Pass</div>
            <div class="stat-shine"></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Fail</div>
            <div class="stat-shine"></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0%</div>
            <div class="stat-label">Avg Confidence</div>
            <div class="stat-shine"></div>
          </div>
        </div>
      </div>

      <!-- Empty Table -->
      <div class="table-section animate-scale-in" style="animation-delay: 0.5s">
        <h3>Live Prediction Stream</h3>
        <div class="empty-table">
          <table mat-table [dataSource]="emptyTableData" class="prediction-table">
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>TIME</th>
              <td mat-cell *matCellDef="let row">{{row.time}}</td>
            </ng-container>
            
            <ng-container matColumnDef="sampleId">
              <th mat-header-cell *matHeaderCellDef>SAMPLE ID</th>
              <td mat-cell *matCellDef="let row">{{row.sampleId}}</td>
            </ng-container>
            
            <ng-container matColumnDef="prediction">
              <th mat-header-cell *matHeaderCellDef>PREDICTION</th>
              <td mat-cell *matCellDef="let row">{{row.prediction}}</td>
            </ng-container>
            
            <ng-container matColumnDef="confidence">
              <th mat-header-cell *matHeaderCellDef>CONFIDENCE</th>
              <td mat-cell *matCellDef="let row">{{row.confidence}}</td>
            </ng-container>
            
            <ng-container matColumnDef="temperature">
              <th mat-header-cell *matHeaderCellDef>TEMPERATURE</th>
              <td mat-cell *matCellDef="let row">{{row.temperature}}</td>
            </ng-container>
            
            <ng-container matColumnDef="pressure">
              <th mat-header-cell *matHeaderCellDef>PRESSURE</th>
              <td mat-cell *matCellDef="let row">{{row.pressure}}</td>
            </ng-container>
            
            <ng-container matColumnDef="humidity">
              <th mat-header-cell *matHeaderCellDef>HUMIDITY</th>
              <td mat-cell *matCellDef="let row">{{row.humidity}}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="fullDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: fullDisplayedColumns;"></tr>
          </table>
        </div>
        <div class="table-glow"></div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading-container animate-fade-in">
      <div class="loading-wrapper">
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <div class="loading-pulse"></div>
      </div>
      <p class="loading-text">Loading simulation data...</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <!-- Active/Complete Simulation State -->
    <div *ngIf="hasStarted && !isLoading" class="simulation-active animate-slide-up">
      <!-- Simulation Control -->
      <div class="simulation-control animate-scale-in">
        <div *ngIf="isRunning" class="running-status">
          <mat-spinner diameter="20"></mat-spinner>
          <span>Simulation Running</span>
          <div class="status-glow"></div>
        </div>
        <div *ngIf="isCompleted" class="completed-status">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <span>Simulation completed</span>
          <div class="success-glow"></div>
        </div>
        <button mat-raised-button color="primary" class="restart-button" (click)="restartSimulation()" *ngIf="isCompleted">
          <mat-icon>refresh</mat-icon>
          Restart Simulation
        </button>
      </div>

      <!-- Live Charts -->
      <div class="charts-section">
        <div class="chart-container animate-scale-in" style="animation-delay: 0.2s">
          <h3 class="chart-title">
            <mat-icon>show_chart</mat-icon>
            Real Time Quality Predictions
          </h3>
          <div class="chart-wrapper">
            <canvas baseChart
                    [data]="lineChartData"
                    [options]="lineChartOptions"
                    type="line">
            </canvas>
          </div>
          <div class="chart-glow"></div>
        </div>
        
        <div class="chart-container animate-scale-in" style="animation-delay: 0.3s">
          <h3 class="chart-title">
            <mat-icon>donut_large</mat-icon>
            Prediction Confidence
          </h3>
          <div class="chart-wrapper">
            <canvas baseChart
                    [data]="donutChartData"
                    [options]="donutChartOptions"
                    type="doughnut">
            </canvas>
          </div>
          <div class="chart-glow"></div>
        </div>
      </div>

      <!-- Live Statistics -->
      <div class="statistics-section animate-scale-in" style="animation-delay: 0.4s">
        <h3>Live Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card live-stat" [class.updated]="processedRowsCount > 0">
            <div class="stat-value">{{processedRowsCount}}</div>
            <div class="stat-label">Total</div>
            <div class="stat-shine"></div>
          </div>
          <div class="stat-card live-stat" [class.updated]="passCount > 0">
            <div class="stat-value">{{passCount}}</div>
            <div class="stat-label">Pass</div>
            <div class="stat-shine"></div>
          </div>
          <div class="stat-card live-stat" [class.updated]="failCount > 0">
            <div class="stat-value">{{failCount}}</div>
            <div class="stat-label">Fail</div>
            <div class="stat-shine"></div>
          </div>
          <div class="stat-card live-stat" [class.updated]="averageConfidence > 0">
            <div class="stat-value">{{averageConfidence.toFixed(0)}}%</div>
            <div class="stat-label">Avg Confidence</div>
            <div class="stat-shine"></div>
          </div>
        </div>
      </div>

      <!-- Live Prediction Table -->
      <div class="table-section animate-scale-in" style="animation-delay: 0.5s">
        <h3>Live Prediction Stream</h3>
         <div class="table-container">
           <table mat-table [dataSource]="tableDataSource" class="prediction-table">
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>TIME</th>
              <td mat-cell *matCellDef="let row">{{formatTime(row.timestamp)}}</td>
            </ng-container>
            
            <ng-container matColumnDef="sampleId">
              <th mat-header-cell *matHeaderCellDef>SAMPLE ID</th>
              <td mat-cell *matCellDef="let row">SAMPLE_{{(row.rowIndex + 1).toString().padStart(3, '0')}}</td>
            </ng-container>
            
            <ng-container matColumnDef="prediction">
              <th mat-header-cell *matHeaderCellDef>PREDICTION</th>
              <td mat-cell *matCellDef="let row">
                <span [class]="getPredictionClass(row.prediction)">
                  {{row.prediction === 1 ? 'Pass' : 'Fail'}}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="confidence">
              <th mat-header-cell *matHeaderCellDef>CONFIDENCE</th>
              <td mat-cell *matCellDef="let row">
                <span class="confidence-badge">{{(row.confidence * 100).toFixed(0)}}%</span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="temperature">
              <th mat-header-cell *matHeaderCellDef>TEMPERATURE</th>
              <td mat-cell *matCellDef="let row">{{row.sensorData?.temperature}}</td>
            </ng-container>
            
            <ng-container matColumnDef="pressure">
              <th mat-header-cell *matHeaderCellDef>PRESSURE</th>
              <td mat-cell *matCellDef="let row">{{row.sensorData?.pressure}}</td>
            </ng-container>
            
            <ng-container matColumnDef="humidity">
              <th mat-header-cell *matHeaderCellDef>HUMIDITY</th>
              <td mat-cell *matCellDef="let row">{{row.sensorData?.humidity}}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="fullDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: fullDisplayedColumns;" class="table-row"></tr>
          </table>
        </div>
        <div class="table-glow"></div>
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
        transform: scale(1.1);
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

    @keyframes flashUpdate {
      0% { background-color: rgba(33, 150, 243, 0.3); }
      100% { background-color: transparent; }
    }

    @keyframes slideInRow {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
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
      cursor: pointer;
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

    /* Before Start State */
    .before-start {
      max-width: 1000px;
      margin: 0 auto;
    }

    .start-button-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .start-simulation-btn {
      font-size: 16px;
      font-weight: 500;
      padding: 12px 32px;
      margin-bottom: 16px;
      border-radius: 25px;
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .start-simulation-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .start-simulation-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    }

    .start-simulation-btn:hover::before {
      left: 100%;
    }

    .start-simulation-btn mat-icon {
      margin-right: 8px;
      transition: transform 0.3s ease;
    }

    .start-simulation-btn:hover mat-icon {
      transform: scale(1.1) rotate(360deg);
      transition: transform 0.5s ease;
    }

    .start-instruction {
      color: #666;
      font-size: 14px;
      margin: 16px 0 0 0;
      transition: color 0.3s ease;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
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

    .chart-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0 0 20px 0;
      flex-shrink: 0;
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

    .empty-chart, .chart-wrapper {
      flex: 1;
      min-height: 200px;
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

    /* Statistics Section */
    .statistics-section {
      margin: 40px 0;
    }

    .statistics-section h3 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
      transition: color 0.3s ease;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    
    .stat-card {
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      padding: 24px 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-left: 4px solid #2196f3;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 30px rgba(33, 150, 243, 0.15);
      border-left-color: #1976d2;
    }

    .stat-card.live-stat.updated {
      animation: flashUpdate 0.5s ease-out;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      display: block;
      transition: all 0.3s ease;
    }

    .stat-card:hover .stat-value {
      color: #2196f3;
      transform: scale(1.05);
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: color 0.3s ease;
    }

    .stat-card:hover .stat-label {
      color: #2196f3;
    }

    .stat-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s;
    }

    .stat-card:hover .stat-shine {
      left: 100%;
    }

    /* Table Section */
    .table-section {
      margin: 40px 0;
      position: relative;
    }

    .table-section h3 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
      transition: color 0.3s ease;
    }

    .table-container, .empty-table {
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
      max-height: 400px;
      overflow-y: auto;
      position: relative;
      border: 1px solid rgba(33, 150, 243, 0.1);
      transition: all 0.3s ease;
    }

    .table-container:hover, .empty-table:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
     
    .table-container::-webkit-scrollbar {
      width: 8px;
    }
     
    .table-container::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
    }
     
    .table-container::-webkit-scrollbar-thumb {
      background: rgba(33, 150, 243, 0.3);
      border-radius: 4px;
      transition: background 0.3s ease;
    }
     
    .table-container::-webkit-scrollbar-thumb:hover {
      background: rgba(33, 150, 243, 0.5);
    }

    .table-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(33, 150, 243, 0.02) 0%, transparent 70%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .table-section:hover .table-glow {
      opacity: 1;
    }
    
    .prediction-table {
      width: 100%;
    }

    .prediction-table th {
      background: linear-gradient(145deg, #f5f5f5, #eeeeee);
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 12px;
      position: sticky;
      top: 0;
      z-index: 2;
    }

    .prediction-table td {
      font-size: 13px;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.2s ease;
    }

    .table-row {
      transition: all 0.3s ease;
      animation: slideInRow 0.5s ease-out;
    }

    .table-row:hover {
      background: rgba(33, 150, 243, 0.05);
      transform: scale(1.01);
    }

    .prediction-pass {
      color: #4caf50;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      background: rgba(76, 175, 80, 0.1);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .prediction-fail {
      color: #f44336;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      background: rgba(244, 67, 54, 0.1);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .confidence-badge {
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    /* Loading State */
    .loading-container {
      text-align: center;
      padding: 80px 40px;
      position: relative;
    }

    .loading-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 24px;
    }

    .loading-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(33, 150, 243, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-in-out infinite;
    }

    .loading-text {
      color: #666;
      font-size: 16px;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2196f3;
      animation: loadingDots 1.4s ease-in-out infinite both;
    }

    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    .loading-dots span:nth-child(3) { animation-delay: 0s; }

    /* Simulation Active State */
    .simulation-active {
      max-width: 1000px;
      margin: 0 auto;
    }

    .simulation-control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      margin-bottom: 30px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(33, 150, 243, 0.1);
    }

    .simulation-control:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }

    .running-status, .completed-status {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      position: relative;
    }

    .running-status {
      color: #2196f3;
    }

    .completed-status {
      color: #4caf50;
    }

    .success-icon {
      color: #4caf50;
      font-size: 20px;
      animation: bounce 1s ease;
    }

    .status-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, rgba(33, 150, 243, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-in-out infinite;
    }

    .success-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-in-out infinite;
    }

    .restart-button {
      font-size: 14px;
      font-weight: 500;
      padding: 8px 20px;
      border-radius: 20px;
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }

    .restart-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .restart-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    }

    .restart-button:hover::before {
      left: 100%;
    }

    .restart-button mat-icon {
      margin-right: 6px;
      transition: transform 0.3s ease;
    }

    .restart-button:hover mat-icon {
      transform: rotate(360deg);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .charts-section {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .simulation-control {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .chart-container {
        height: 280px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .start-simulation-btn {
        padding: 10px 24px;
        font-size: 14px;
      }

      .stat-card {
        padding: 16px 12px;
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
export class SimulationComponent implements OnInit, OnDestroy {
  datasetId!: number;
  simulationData: SimulationRow[] = [];
  processedRowsData: SimulationRow[] = [];
  recentRows: SimulationRow[] = [];
  tableDataSource = new MatTableDataSource<SimulationRow>([]);
  isLoading = false;
  isRunning = false;
  isCompleted = false;
  hasStarted = false;
  currentIndex = 0;
  intervalId?: number;
  
  // Statistics
  processedRowsCount = 0;
  passCount = 0;
  failCount = 0;
  averageConfidence = 0;

  // Empty state data
  emptyTableData = [];
  
  get processedRows(): number {
    return this.processedRowsCount;
  }
  
  // Chart data
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Quality Score',
      data: [],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  };
  
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        display: true,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        },
        title: {
          display: true,
          text: 'Time',
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
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };
  
  donutChartData: ChartData<'doughnut'> = {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4caf50', '#f44336'],
      borderWidth: 0
    }]
  };
  
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#666',
          usePointStyle: true
        }
      }
    }
  };
  
  displayedColumns = ['rowIndex', 'timestamp', 'prediction', 'confidence'];
  fullDisplayedColumns = ['time', 'sampleId', 'prediction', 'confidence', 'temperature', 'pressure', 'humidity'];

  // Empty chart data for before state
  emptyLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Quality Score',
      data: [],
      borderColor: '#2196f3',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.4
    }]
  };

  emptyDonutChartData: ChartData<'doughnut'> = {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [],
      backgroundColor: ['#4caf50', '#f44336'],
      borderWidth: 0
    }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datasetId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startSimulation() {
    this.isLoading = true;
    this.hasStarted = true;
    
    this.apiService.getSimulationData(this.datasetId).subscribe({
      next: (data) => {
        this.simulationData = data;
        this.isLoading = false;
        this.runSimulation();
      },
      error: (error) => {
        console.error('Error loading simulation data:', error);
        this.snackBar.open('Failed to load simulation data', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.hasStarted = false;
      }
    });
  }

  runSimulation() {
    this.isRunning = true;
    this.currentIndex = 0;
    this.processedRowsCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.processedRowsData = [];
    this.recentRows = [];
    this.tableDataSource.data = [];
    
    this.intervalId = window.setInterval(() => {
      if (this.currentIndex < this.simulationData.length) {
        this.processNextRow();
      } else {
        this.completeSimulation();
      }
    }, 1000); // 1 second interval
  }

  processNextRow() {
    const row = this.simulationData[this.currentIndex];
    
    this.apiService.simulateStep(this.datasetId, row).subscribe({
      next: (response) => {
        const processedRow = response.row;
        this.processedRowsData.push(processedRow);
        this.processedRowsCount++;
        
        // Update statistics
        if (processedRow.prediction === 1) {
          this.passCount++;
        } else {
          this.failCount++;
        }
        
        this.updateAverageConfidence();
        this.updateCharts(processedRow);
        this.updateRecentRows(processedRow);
        
        this.currentIndex++;
      },
      error: (error) => {
        console.error('Simulation error:', error);
        this.snackBar.open('Simulation error occurred', 'Close', { duration: 3000 });
      }
    });
  }

  updateAverageConfidence() {
    if (this.processedRowsData.length > 0) {
      const totalConfidence = this.processedRowsData.reduce((sum, row) => sum + (row.confidence || 0), 0);
      this.averageConfidence = (totalConfidence / this.processedRowsData.length) * 100;
    }
  }

  updateCharts(row: SimulationRow) {
    // Update line chart with quality scores
    const labels = this.lineChartData.labels as string[];
    const confidenceData = this.lineChartData.datasets[0].data as number[];
    
    // Add new data point
    const timeLabel = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    labels.push(timeLabel);
    
    // Use confidence as quality score (75-95% range for realistic simulation)
    const qualityScore = Math.max(75, Math.min(95, (row.confidence || 0) * 100 + Math.random() * 10));
    confidenceData.push(qualityScore);
    
    // Keep only last 20 data points for better visibility
    if (labels.length > 20) {
      labels.shift();
      confidenceData.shift();
    }
    
    // Force chart update by creating new object
    this.lineChartData = {
      labels: [...labels],
      datasets: [{
        label: 'Quality Score',
        data: [...confidenceData],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    };
    
    // Update donut chart
    this.donutChartData = {
      labels: ['Pass', 'Fail'],
      datasets: [{
        data: [this.passCount, this.failCount],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 0
      }]
    };
  }

  updateRecentRows(row: SimulationRow) {
    // Generate sensor data once and store it with the row
    const enhancedRow = {
      ...row,
      sensorData: {
        temperature: (20 + Math.random() * 20).toFixed(1) + '°C', // 20-40°C
        pressure: Math.floor(1000 + Math.random() * 100) + ' hPa', // 1000-1100 hPa
        humidity: (50 + Math.random() * 30).toFixed(1) + '%' // 50-80%
      }
    };
    
    this.recentRows.unshift(enhancedRow);
    if (this.recentRows.length > 10) {
      this.recentRows.pop();
    }
    
    // Update the MatTableDataSource and trigger change detection
    this.tableDataSource.data = [...this.recentRows];
    this.cdr.detectChanges();
    
    console.log('📊 Added row to table. Recent rows count:', this.recentRows.length);
    console.log('📋 Enhanced row:', enhancedRow);
    console.log('📋 Table data source updated:', this.tableDataSource.data.length, 'rows');
  }

  completeSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    this.isCompleted = true;
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
  }

  restartSimulation() {
    this.isCompleted = false;
    this.isRunning = false;
    this.processedRowsCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.averageConfidence = 0;
    this.processedRowsData = [];
    this.recentRows = [];
    this.currentIndex = 0;
    
    // Reset charts
    this.lineChartData = {
      labels: [],
      datasets: [{
        label: 'Quality Score',
        data: [],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    };
    
    this.donutChartData = {
      labels: ['Pass', 'Fail'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 0
      }]
    };
    
    this.runSimulation();
  }

  goBack() {
    this.router.navigate(['/training', this.datasetId]);
  }

  goToStart() {
    this.router.navigate(['/upload']);
  }

  formatTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  }

  getPredictionClass(prediction: number | undefined): string {
    return prediction === 1 ? 'prediction-pass' : 'prediction-fail';
  }
}