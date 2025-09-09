import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Dataset } from '../../models/dataset.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header animate-fade-in">
      <h2>Upload Dataset</h2>
      <div class="step-indicator">Step 1 of 4</div>
    </div>
      
    <div *ngIf="!dataset && !isUploading" class="upload-section animate-slide-up">
      <p class="instruction-text">Click to select a CSV file or drag and drop</p>
      
      <div class="upload-area" (click)="fileInput.click()" 
           (dragover)="onDragOver($event)" 
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.drag-over]="isDragOver">
        <div class="upload-content">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="upload-text">Drop your CSV file here or click to browse</p>
          <small class="upload-hint">Only CSV files are supported</small>
        </div>
        <div class="upload-glow"></div>
      </div>
      
      <input #fileInput type="file" accept=".csv" (change)="onFileSelected($event)" style="display: none;">
    </div>
    
    <div *ngIf="isUploading" class="loading-container animate-fade-in">
      <div class="loading-wrapper">
        <mat-spinner diameter="50"></mat-spinner>
        <div class="loading-pulse"></div>
      </div>
      <p class="loading-text">Processing your dataset...</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <div *ngIf="dataset && !isUploading" class="results-section animate-slide-up">
      <!-- Metadata Card -->
      <div class="metadata-card-container">
        <div class="metadata-grid">
          <!-- CSV File -->
          <div class="metadata-item animate-scale-in" style="animation-delay: 0.1s">
            <div class="metadata-icon">
              <mat-icon>description</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">CSV File</div>
              <div class="metadata-value">{{dataset.fileName}}</div>
              <div class="metadata-subtext">{{getFileSize()}}</div>
            </div>
            <div class="metadata-shine"></div>
          </div>

          <!-- Records -->
          <div class="metadata-item animate-scale-in" style="animation-delay: 0.2s">
            <div class="metadata-icon">
              <mat-icon>storage</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Records</div>
              <div class="metadata-value">{{dataset.totalRows | number}}</div>
            </div>
            <div class="metadata-shine"></div>
          </div>

          <!-- Columns -->
          <div class="metadata-item animate-scale-in" style="animation-delay: 0.3s">
            <div class="metadata-icon">
              <mat-icon>view_column</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Columns</div>
              <div class="metadata-value">{{dataset.totalColumns}}</div>
            </div>
            <div class="metadata-shine"></div>
          </div>

          <!-- Pass Rate -->
          <div class="metadata-item animate-scale-in" style="animation-delay: 0.4s">
            <div class="metadata-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Pass Rate</div>
              <div class="metadata-value">{{(dataset.passRate * 100).toFixed(0)}}%</div>
            </div>
            <div class="metadata-shine"></div>
          </div>

          <!-- Date Range -->
          <div class="metadata-item animate-scale-in" style="animation-delay: 0.5s">
            <div class="metadata-icon">
              <mat-icon>date_range</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Date Range</div>
              <div class="metadata-value">{{formatDateRange()}}</div>
              <div class="metadata-subtext">{{formatDateRangeSub()}}</div>
            </div>
            <div class="metadata-shine"></div>
          </div>
        </div>
      </div>
      
      <!-- Next Button -->
      <div class="next-button-container animate-fade-in" style="animation-delay: 0.6s">
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
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.7;
      }
      100% {
        transform: scale(1);
        opacity: 1;
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

    .instruction-text {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
      text-align: center;
      transition: color 0.3s ease;
    }
    
    /* Upload Section */
    .upload-section {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 16px;
      padding: 60px 40px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .upload-area::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent, rgba(33, 150, 243, 0.05), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .upload-area:hover {
      border-color: #2196f3;
      background: linear-gradient(145deg, #f8fbff, #e3f2fd);
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
    }

    .upload-area:hover::before {
      opacity: 1;
    }

    .upload-area.drag-over {
      border-color: #2196f3;
      background: linear-gradient(145deg, #f0f8ff, #e1f5fe);
      animation: glow 1.5s ease-in-out infinite;
      transform: scale(1.02);
    }

    .upload-content {
      position: relative;
      z-index: 2;
    }

    .upload-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.4s ease;
      pointer-events: none;
    }

    .upload-area:hover .upload-glow {
      width: 300px;
      height: 300px;
    }
    
    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
      margin-bottom: 16px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .upload-area:hover .upload-icon {
      color: #2196f3;
      transform: scale(1.1) rotate(5deg);
      animation: bounce 1s ease;
    }

    .upload-text {
      color: #666;
      font-size: 16px;
      margin: 16px 0 8px 0;
      transition: all 0.3s ease;
    }

    .upload-area:hover .upload-text {
      color: #2196f3;
      font-weight: 500;
    }

    .upload-hint {
      color: #999;
      font-size: 12px;
      transition: color 0.3s ease;
    }

    .upload-area:hover .upload-hint {
      color: #666;
    }
    
    /* Loading Section */
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
      transition: all 0.3s ease;
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

    /* Results Section */
    .results-section {
      max-width: 900px;
      margin: 0 auto;
    }

    .metadata-card-container {
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 30px;
      margin-bottom: 30px;
      transition: all 0.3s ease;
      border: 1px solid rgba(33, 150, 243, 0.1);
    }

    .metadata-card-container:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .metadata-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      background: linear-gradient(145deg, #fafafa, #f0f0f0);
      border-left: 4px solid #e0e0e0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .metadata-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -4px;
      width: 4px;
      height: 100%;
      background: linear-gradient(45deg, #2196f3, #21cbf3);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .metadata-item:hover {
      background: linear-gradient(145deg, #ffffff, #f5f5f5);
      transform: translateX(8px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
    }

    .metadata-item:hover::before {
      transform: scaleY(1);
    }

    .metadata-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      transition: left 0.5s;
    }

    .metadata-item:hover .metadata-shine {
      left: 100%;
    }

    .metadata-icon {
      background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
      border-radius: 10px;
      padding: 12px;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .metadata-item:hover .metadata-icon {
      background: linear-gradient(145deg, #2196f3, #1976d2);
      transform: scale(1.1);
    }

    .metadata-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #666;
      transition: color 0.3s ease;
    }

    .metadata-item:hover .metadata-icon mat-icon {
      color: white;
    }

    .metadata-content {
      flex: 1;
      min-width: 0;
    }

    .metadata-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .metadata-item:hover .metadata-label {
      color: #2196f3;
    }

    .metadata-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      word-break: break-all;
      transition: all 0.3s ease;
    }

    .metadata-item:hover .metadata-value {
      color: #2196f3;
    }

    .metadata-subtext {
      font-size: 11px;
      color: #999;
      transition: color 0.3s ease;
    }

    .metadata-item:hover .metadata-subtext {
      color: #666;
    }

    /* Next Button */
    .next-button-container {
      text-align: right;
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

    /* Responsive */
    @media (max-width: 768px) {
      .metadata-grid {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .upload-area {
        padding: 40px 20px;
      }

      .metadata-card-container {
        padding: 20px;
      }

      .metadata-item {
        padding: 16px;
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
export class UploadComponent {
  dataset: Dataset | null = null;
  isUploading = false;
  isDragOver = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.snackBar.open('Please select a CSV file', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.dataset = null;

    this.apiService.uploadDataset(file).subscribe({
      next: (dataset) => {
        this.dataset = dataset;
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.snackBar.open('Upload failed. Please try again.', 'Close', { duration: 5000 });
        this.isUploading = false;
      }
    });
  }

  uploadAnother() {
    this.dataset = null;
  }

  nextStep() {
    if (this.dataset) {
      this.router.navigate(['/date-ranges', this.dataset.datasetId]);
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  formatDateRange(): string {
    if (!this.dataset?.earliestTimestamp || !this.dataset?.latestTimestamp) return 'N/A';
    const start = new Date(this.dataset.earliestTimestamp).toLocaleDateString();
    return start;
  }

  formatDateRangeSub(): string {
    if (!this.dataset?.earliestTimestamp || !this.dataset?.latestTimestamp) return '';
    const start = new Date(this.dataset.earliestTimestamp);
    const end = new Date(this.dataset.latestTimestamp);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `to ${end.toLocaleDateString()}`;
  }

  getFileSize(): string {
    // Estimate file size based on rows/columns for display
    if (!this.dataset) return '';
    const estimatedSize = Math.round((this.dataset.totalRows * this.dataset.totalColumns * 10) / 1024);
    return estimatedSize > 1024 ? `${(estimatedSize/1024).toFixed(1)} MB` : `${estimatedSize} KB`;
  }
}