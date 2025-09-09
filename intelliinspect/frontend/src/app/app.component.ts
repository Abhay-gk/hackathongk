import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatStepperModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Header -->
    <div class="main-header">
      <div class="header-content">
        <div class="brand-section">
          <h1>MiniML - Predictive Quality Control - IntelliInspect</h1>
          <p class="subtitle">Simplified Frontend</p>
        </div>
        <div class="abb-logo">
          <img src="assets/abb.png" alt="ABB" class="abb-logo-img">
        </div>
      </div>
    </div>

    <!-- Progress Stepper -->
    <div class="stepper-container">
      <div class="custom-stepper">
        <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
          <div class="step-circle">1</div>
          <div class="step-label">Upload Dataset</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
          <div class="step-circle">2</div>
          <div class="step-label">Date Ranges</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
          <div class="step-circle">3</div>
          <div class="step-label">Model Training</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" [class.active]="currentStep === 4" [class.completed]="currentStep > 4">
          <div class="step-circle">4</div>
          <div class="step-label">Simulation</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-container">
      <router-outlet></router-outlet>
    </div>

    <!-- Footer -->
    <div class="gradient-footer">
      <div class="footer-content">
        <div class="footer-text">ENGINEERED TO OUTRUN</div>
        <div class="footer-subtitle">MiniML POC</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .main-header {
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f0f0 100%);
      padding: 20px 0;
      border-bottom: 1px solid #ddd;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-section h1 {
      font-size: 28px;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
      margin: 4px 0 0 0;
    }

    .abb-logo {
      opacity: 0.8;
    }

    .abb-logo-img {
      height: 60px;
      width: auto;
      object-fit: contain;
    }

    .stepper-container {
      background: white;
      padding: 20px 0;
      border-bottom: 1px solid #ddd;
    }

    .custom-stepper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ccc;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .step.active .step-circle {
      background: #4caf50;
    }

    .step.completed .step-circle {
      background: #4caf50;
    }

    .step-label {
      margin-top: 8px;
      font-size: 12px;
      text-align: center;
      color: #666;
      font-weight: 500;
    }

    .step.active .step-label {
      color: #4caf50;
      font-weight: 600;
    }

    .step-connector {
      flex: 1;
      height: 2px;
      background: #ddd;
      margin: 0 10px;
      max-width: 80px;
    }

    .main-container {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
      width: 100%;
      box-sizing: border-box;
    }

    .gradient-footer {
      background: linear-gradient(90deg, #dc143c 0%, #8b5cf6 100%);
      padding: 15px 0;
      text-align: center;
    }

    .footer-content {
      color: white;
    }

    .footer-text {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .footer-subtitle {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 2px;
    }
  `]
})
export class AppComponent {
  title = 'MiniML';
  currentStep = 1;

  constructor(private router: Router) {
    // Update current step based on route
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('date-ranges')) {
        this.currentStep = 2;
      } else if (url.includes('training')) {
        this.currentStep = 3;
      } else if (url.includes('simulation')) {
        this.currentStep = 4;
      } else {
        this.currentStep = 1;
      }
    });
  }
}
