import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";
import { predictVehicleHealth } from "../../utils/mlClient";
import { alertsService } from "../alerts/alerts.service";

export const healthService = {
  async list(vehicleId?: string) {
    return prisma.healthPrediction.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        telemetry: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(predictionId: string) {
    const prediction = await prisma.healthPrediction.findUnique({
      where: { predictionId },
      include: {
        telemetry: true,
        recommendations: true,
        alerts: true,
      },
    });

    if (!prediction) throw new ApiError("Prediction not found", 404);
    return prediction;
  },

  async evaluateLive(
    vehicleId: string,
    telemetryData: {
      engine_rpm?: number;
      lub_oil_pressure?: number;
      fuel_pressure?: number;
      coolant_pressure?: number;
      lub_oil_temp?: number;
      coolant_temp?: number;
    }
  ) {
    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicleId },
    });

    if (!vehicle) {
      throw new ApiError("Vehicle not found", 404);
    }

    // Store telemetry data in database
    const telemetry = await prisma.telemetry.create({
      data: {
        vehicleId,
        source: "MANUAL_ENTRY",
        engineTemp: telemetryData.lub_oil_temp ?? null,
        batteryVoltage: null,
        rpm: telemetryData.engine_rpm ?? null,
        oilPressure: telemetryData.lub_oil_pressure ?? null,
        mileage: null,
        vibrationLevel: null,
        fuelEfficiency: null,
        errorCodesCount: 0,
        ambientTemperature: null,
        coolantLevel: telemetryData.coolant_pressure ?? null,
        recordedAt: new Date(),
      },
    });

    // Use ML model to predict health
    const prediction = await predictVehicleHealth({
      engine_rpm: telemetryData.engine_rpm ?? null,
      lub_oil_pressure: telemetryData.lub_oil_pressure ?? null,
      fuel_pressure: telemetryData.fuel_pressure ?? null,
      coolant_pressure: telemetryData.coolant_pressure ?? null,
      lub_oil_temp: telemetryData.lub_oil_temp ?? null,
      coolant_temp: telemetryData.coolant_temp ?? null,
    });

    // ML Model's actual safe ranges and thresholds used during training
    const ML_SAFE_RANGES = {
      engine_rpm: { min: 500, max: 1500, unit: 'RPM' },
      lub_oil_pressure: { min: 2.0, max: 6.0, unit: 'bar' },
      fuel_pressure: { min: 10.0, max: 20.0, unit: 'bar' },
      coolant_pressure: { min: 1.0, max: 4.0, unit: 'bar' },
      lub_oil_temp: { min: 60.0, max: 95.0, unit: '°C' },
      coolant_temp: { min: 75.0, max: 90.0, unit: '°C' }
    };

    // Generate accurate diagnostic analysis based on actual parameter values
    const outOfRangeParams: string[] = [];
    
    if (telemetryData.engine_rpm !== undefined && telemetryData.engine_rpm !== null) {
      const { min, max } = ML_SAFE_RANGES.engine_rpm;
      if (telemetryData.engine_rpm < min) {
        outOfRangeParams.push(`Engine RPM (${telemetryData.engine_rpm}) below safe range (${min}-${max})`);
      } else if (telemetryData.engine_rpm > max) {
        outOfRangeParams.push(`Engine RPM (${telemetryData.engine_rpm}) above safe range (${min}-${max})`);
      }
    }
    
    if (telemetryData.lub_oil_pressure !== undefined && telemetryData.lub_oil_pressure !== null) {
      const { min, max } = ML_SAFE_RANGES.lub_oil_pressure;
      if (telemetryData.lub_oil_pressure < min) {
        outOfRangeParams.push(`Oil Pressure (${telemetryData.lub_oil_pressure} bar) below safe range (${min}-${max})`);
      } else if (telemetryData.lub_oil_pressure > max) {
        outOfRangeParams.push(`Oil Pressure (${telemetryData.lub_oil_pressure} bar) above safe range (${min}-${max})`);
      }
    }
    
    if (telemetryData.fuel_pressure !== undefined && telemetryData.fuel_pressure !== null) {
      const { min, max } = ML_SAFE_RANGES.fuel_pressure;
      if (telemetryData.fuel_pressure < min) {
        outOfRangeParams.push(`Fuel Pressure (${telemetryData.fuel_pressure} bar) below safe range (${min}-${max})`);
      } else if (telemetryData.fuel_pressure > max) {
        outOfRangeParams.push(`Fuel Pressure (${telemetryData.fuel_pressure} bar) above safe range (${min}-${max})`);
      }
    }
    
    if (telemetryData.coolant_pressure !== undefined && telemetryData.coolant_pressure !== null) {
      const { min, max } = ML_SAFE_RANGES.coolant_pressure;
      if (telemetryData.coolant_pressure < min) {
        outOfRangeParams.push(`Coolant Pressure (${telemetryData.coolant_pressure} bar) below safe range (${min}-${max})`);
      } else if (telemetryData.coolant_pressure > max) {
        outOfRangeParams.push(`Coolant Pressure (${telemetryData.coolant_pressure} bar) above safe range (${min}-${max})`);
      }
    }
    
    if (telemetryData.lub_oil_temp !== undefined && telemetryData.lub_oil_temp !== null) {
      const { min, max } = ML_SAFE_RANGES.lub_oil_temp;
      if (telemetryData.lub_oil_temp < min) {
        outOfRangeParams.push(`Oil Temperature (${telemetryData.lub_oil_temp}°C) below safe range (${min}-${max})`);
      } else if (telemetryData.lub_oil_temp > max) {
        outOfRangeParams.push(`Oil Temperature (${telemetryData.lub_oil_temp}°C) above safe range (${min}-${max})`);
      }
    }
    
    if (telemetryData.coolant_temp !== undefined && telemetryData.coolant_temp !== null) {
      const { min, max } = ML_SAFE_RANGES.coolant_temp;
      if (telemetryData.coolant_temp < min) {
        outOfRangeParams.push(`Coolant Temperature (${telemetryData.coolant_temp}°C) below safe range (${min}-${max})`);
      } else if (telemetryData.coolant_temp > max) {
        outOfRangeParams.push(`Coolant Temperature (${telemetryData.coolant_temp}°C) above safe range (${min}-${max})`);
      }
    }

    // Generate diagnostic analysis based on actual conditions
    let diagnosticAnalysis: string;
    if (outOfRangeParams.length > 0) {
      diagnosticAnalysis = `⚠️ Warning: ${outOfRangeParams.length} parameter(s) out of safe range:\n${outOfRangeParams.map(p => `• ${p}`).join('\n')}`;
    } else {
      diagnosticAnalysis = "All parameters within safe operating range.";
    }

    // Store health prediction in database
    const healthPrediction = await prisma.healthPrediction.create({
      data: {
        vehicleId,
        telemetryId: telemetry.telemetryId,
        healthScore: prediction.healthScore,
        status: prediction.status,
        failureProbability: prediction.failureProbability,
        riskLevel: prediction.riskLevel,
        predictedFailureDays: prediction.predictedFailureDays,
        confidenceScore: prediction.confidenceScore,
        modelVersion: prediction.modelVersion,
        diagnosticAnalysis: diagnosticAnalysis, // Use our generated analysis
        topInfluentialFeatures: prediction.topInfluentialFeatures || [],
      },
    });

    // Calculate component health based on ML model's actual safe ranges
    const calculateComponentHealth = () => {
      // Engine health (RPM, oil pressure, oil temp, fuel pressure)
      let engineScore = 100;
      let engineIssues = 0;
      
      if (telemetryData.engine_rpm) {
        const { min, max } = ML_SAFE_RANGES.engine_rpm;
        const range = max - min;
        if (telemetryData.engine_rpm < min) {
          const deviation = (min - telemetryData.engine_rpm) / range;
          engineScore -= Math.min(40, deviation * 50);
          engineIssues++;
        } else if (telemetryData.engine_rpm > max) {
          const deviation = (telemetryData.engine_rpm - max) / range;
          engineScore -= Math.min(40, deviation * 50);
          engineIssues++;
        }
      }
      
      if (telemetryData.lub_oil_pressure) {
        const { min, max } = ML_SAFE_RANGES.lub_oil_pressure;
        const range = max - min;
        if (telemetryData.lub_oil_pressure < min) {
          const deviation = (min - telemetryData.lub_oil_pressure) / range;
          engineScore -= Math.min(35, deviation * 60);
          engineIssues++;
        } else if (telemetryData.lub_oil_pressure > max) {
          const deviation = (telemetryData.lub_oil_pressure - max) / range;
          engineScore -= Math.min(30, deviation * 40);
          engineIssues++;
        }
      }
      
      if (telemetryData.lub_oil_temp) {
        const { min, max } = ML_SAFE_RANGES.lub_oil_temp;
        const range = max - min;
        if (telemetryData.lub_oil_temp < min) {
          const deviation = (min - telemetryData.lub_oil_temp) / range;
          engineScore -= Math.min(30, deviation * 40);
          engineIssues++;
        } else if (telemetryData.lub_oil_temp > max) {
          const deviation = (telemetryData.lub_oil_temp - max) / range;
          engineScore -= Math.min(35, deviation * 50);
          engineIssues++;
        }
      }
      
      if (telemetryData.fuel_pressure) {
        const { min, max } = ML_SAFE_RANGES.fuel_pressure;
        const range = max - min;
        if (telemetryData.fuel_pressure < min) {
          const deviation = (min - telemetryData.fuel_pressure) / range;
          engineScore -= Math.min(25, deviation * 40);
          engineIssues++;
        } else if (telemetryData.fuel_pressure > max) {
          const deviation = (telemetryData.fuel_pressure - max) / range;
          engineScore -= Math.min(20, deviation * 30);
          engineIssues++;
        }
      }
      
      // Cooling health (coolant temp, coolant pressure)
      let coolingScore = 100;
      let coolingIssues = 0;
      
      if (telemetryData.coolant_temp) {
        const { min, max } = ML_SAFE_RANGES.coolant_temp;
        const range = max - min;
        if (telemetryData.coolant_temp < min) {
          const deviation = (min - telemetryData.coolant_temp) / range;
          coolingScore -= Math.min(40, deviation * 50);
          coolingIssues++;
        } else if (telemetryData.coolant_temp > max) {
          const deviation = (telemetryData.coolant_temp - max) / range;
          coolingScore -= Math.min(50, deviation * 60);
          coolingIssues++;
        }
      }
      
      if (telemetryData.coolant_pressure) {
        const { min, max } = ML_SAFE_RANGES.coolant_pressure;
        const range = max - min;
        if (telemetryData.coolant_pressure < min) {
          const deviation = (min - telemetryData.coolant_pressure) / range;
          coolingScore -= Math.min(40, deviation * 60);
          coolingIssues++;
        } else if (telemetryData.coolant_pressure > max) {
          const deviation = (telemetryData.coolant_pressure - max) / range;
          coolingScore -= Math.min(35, deviation * 50);
          coolingIssues++;
        }
      }
      
      const components: Record<string, number> = {
        engine: Math.max(0, Math.round(engineScore)),
        cooling: Math.max(0, Math.round(coolingScore)),
        // Components not monitored by current sensors (remain stable unless entire vehicle health is critical)
        transmission: Math.max(70, Math.min(90, 100 - (100 - prediction.healthScore) * 0.3)),
        battery: Math.max(70, Math.min(90, 100 - (100 - prediction.healthScore) * 0.2)),
        suspension: Math.max(70, Math.min(90, 100 - (100 - prediction.healthScore) * 0.25)),
      };
      
      return components;
    };

    const components = calculateComponentHealth();

    // Generate intelligent recommendations based on detected patterns
    const recommendationsText: string[] = [];

    // Generate recommendations from diagnostic analysis and ML insights
    if (outOfRangeParams.length > 0) {
      // Critical issues
      const criticalParams = outOfRangeParams.filter(param => 
        param.includes('Oil Pressure') || param.includes('Oil Temperature') || param.includes('Coolant Temperature')
      );
      
      if (criticalParams.length > 0) {
        recommendationsText.push(
          `🔴 URGENT: ${outOfRangeParams.length} critical parameter(s) out of safe range. Immediate inspection required to prevent vehicle damage.`
        );
      } else {
        recommendationsText.push(
          `🟠 WARNING: ${outOfRangeParams.length} parameter(s) out of safe range. Schedule maintenance check within 7 days.`
        );
      }

      // Add specific recommendations based on actual out-of-range parameters
      for (const paramLine of outOfRangeParams) {
        if (paramLine.includes('Oil Pressure') && paramLine.includes('below')) {
          recommendationsText.push("🔴 CRITICAL: Low oil pressure detected. Check oil level immediately, inspect for leaks, and verify oil pump function. Risk of engine damage.");
        } else if (paramLine.includes('Oil Temperature') && paramLine.includes('above')) {
          recommendationsText.push("🔴 CRITICAL: Engine oil overheating. Check cooling system, verify oil quality, and reduce engine load. Stop if temperature exceeds 110°C.");
        } else if (paramLine.includes('Coolant Temperature') && paramLine.includes('above')) {
          recommendationsText.push("🔴 CRITICAL: Engine overheating. Check coolant level, inspect radiator and water pump. Stop driving if temperature exceeds 100°C.");
        } else if (paramLine.includes('Fuel Pressure')) {
          if (paramLine.includes('below')) {
            recommendationsText.push("🟡 MEDIUM: Low fuel pressure. Inspect fuel pump, check fuel filter, and examine fuel lines for leaks.");
          } else {
            recommendationsText.push("🟡 MEDIUM: High fuel pressure. Check fuel pressure regulator and inspect for fuel system blockages.");
          }
        } else if (paramLine.includes('Engine RPM') && paramLine.includes('above')) {
          recommendationsText.push("🟡 MEDIUM: High engine RPM detected. Reduce engine load and check transmission operation.");
        } else if (paramLine.includes('Coolant Pressure')) {
          if (paramLine.includes('below')) {
            recommendationsText.push("🟠 HIGH: Low coolant pressure. Check for coolant leaks and inspect radiator cap seal.");
          } else {
            recommendationsText.push("🟠 HIGH: High coolant pressure. Inspect cooling system for blockages and verify thermostat operation.");
          }
        }
      }
    } else {
      // All parameters in safe range
      if (prediction.failureProbability < 0.3) {
        recommendationsText.push("✅ EXCELLENT: All parameters within safe operating range. Vehicle in optimal condition. Continue regular maintenance schedule.");
      } else if (prediction.failureProbability < 0.5) {
        recommendationsText.push("🟢 GOOD: Parameters within safe range but showing minor wear patterns. Schedule routine check-up within 30 days.");
      } else {
        recommendationsText.push("🟡 CAUTION: Parameters currently safe but vehicle showing elevated failure risk. Recommend comprehensive inspection soon.");
      }
    }

    
    const recommendationPromises = recommendationsText.map((text) => {
      // Extract priority from emoji prefix
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
      if (text.includes('🔴') || text.includes('URGENT') || text.includes('CRITICAL')) {
        priority = 'CRITICAL';
      } else if (text.includes('🟠') || text.includes('HIGH')) {
        priority = 'HIGH';
      } else if (text.includes('🟡') || text.includes('MEDIUM')) {
        priority = 'MEDIUM';
      } else if (text.includes('🟢') || text.includes('✅')) {
        priority = 'LOW';
      }

      return prisma.recommendation.create({
        data: {
          predictionId: healthPrediction.predictionId,
          title: text.substring(0, 80), // First 80 chars as title
          description: text,
          priority,
          actionType: "INSPECT",
          actionDueDays: prediction.predictedFailureDays,
        },
      });
    });

    await Promise.all(recommendationPromises);

    // Create alerts for critical conditions
    let alert = null;
    if (prediction.status === "CRITICAL" || prediction.failureProbability > 0.7) {
      alert = await alertsService.create({
        vehicleId,
        predictionId: healthPrediction.predictionId,
        alertType: "CRITICAL",
        severity: "CRITICAL",
        title: "⚠️ CRITICAL: Immediate Action Required",
        message: diagnosticAnalysis || "Critical vehicle condition detected. Please have your vehicle inspected immediately.",
      });
    } else if (prediction.status === "WARNING" || prediction.failureProbability > 0.4) {
      alert = await alertsService.create({
        vehicleId,
        predictionId: healthPrediction.predictionId,
        alertType: "WARNING",
        severity: "HIGH",
        title: "⚠️ WARNING: Vehicle Maintenance Needed",
        message: diagnosticAnalysis || "Some parameters are out of range. Schedule a maintenance check soon.",
      });
    }

    return {
      predictionId: healthPrediction.predictionId,
      telemetryId: telemetry.telemetryId,
      overallHealth: prediction.healthScore,
      riskLevel: prediction.riskLevel,
      status: prediction.status,
      failureProbability: prediction.failureProbability,
      confidenceScore: prediction.confidenceScore,
      predictedFailureDays: prediction.predictedFailureDays,
      modelVersion: prediction.modelVersion,
      diagnosticAnalysis: diagnosticAnalysis, // Use our generated analysis
      topInfluentialFeatures: prediction.topInfluentialFeatures,
      components,
      recommendations: recommendationsText,
      alert,
    };
  },
};
