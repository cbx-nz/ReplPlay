import React, { useState } from 'react';
import { CarCustomization, CarUpgrades } from '../../../shared/types';

interface CarCustomizationPanelProps {
  customization: CarCustomization;
  onChange: (customization: CarCustomization) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CarCustomizationPanel({ 
  customization, 
  onChange, 
  onClose, 
  isOpen 
}: CarCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'upgrades'>('appearance');

  const bodyColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF7F50', '#98D8C8', '#F7DC6F', '#BB8FCE'
  ];

  const roofColors = [
    '#FFFFFF', '#000000', '#CC5555', '#2E8B57', '#4169E1',
    '#FF1493', '#8B4513', '#708090', '#FFD700', '#9400D3'
  ];

  const wheelColors = [
    '#333333', '#FFFFFF', '#FF0000', '#0000FF', '#FFD700',
    '#C0C0C0', '#800080', '#008000', '#FFA500', '#FF69B4'
  ];

  const bodyTypes: CarCustomization['bodyType'][] = ['sedan', 'sports', 'truck', 'compact'];

  const updateCustomization = (updates: Partial<CarCustomization>) => {
    onChange({ ...customization, ...updates });
  };

  const updateUpgrades = (upgrades: Partial<CarUpgrades>) => {
    onChange({ 
      ...customization, 
      upgrades: { ...customization.upgrades, ...upgrades }
    });
  };

  const getUpgradeCost = (currentLevel: number) => {
    return (currentLevel + 1) * 100;
  };

  const getUpgradeDescription = (type: keyof CarUpgrades, level: number) => {
    const descriptions = {
      engine: [`Basic engine`, `Improved engine (+20% speed)`, `High-performance engine (+40% speed)`, `Racing engine (+60% speed)`, `Supercharged engine (+80% speed)`],
      brakes: [`Basic brakes`, `Improved brakes (+20% stopping)`, `Performance brakes (+40% stopping)`, `Racing brakes (+60% stopping)`, `Carbon brakes (+80% stopping)`],
      handling: [`Basic handling`, `Sport suspension (+20% turning)`, `Performance handling (+40% turning)`, `Racing suspension (+60% turning)`, `Pro handling (+80% turning)`],
      nitro: [`No nitro`, `Nitro boost (+50% speed for 3s)`, `Advanced nitro (+75% speed for 4s)`, `Racing nitro (+100% speed for 5s)`]
    };
    return descriptions[type][level] || 'Max level';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Car Customization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'appearance' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'upgrades' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upgrades
          </button>
        </div>

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Body Type */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Body Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {bodyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => updateCustomization({ bodyType: type })}
                    className={`p-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                      customization.bodyType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Color */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Body Color</h3>
              <div className="grid grid-cols-5 gap-2">
                {bodyColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCustomization({ bodyColor: color })}
                    className={`w-12 h-12 rounded-lg border-4 transition-all ${
                      customization.bodyColor === color
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Roof Color */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Roof Color</h3>
              <div className="grid grid-cols-5 gap-2">
                {roofColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCustomization({ roofColor: color })}
                    className={`w-12 h-12 rounded-lg border-4 transition-all ${
                      customization.roofColor === color
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Wheel Color */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Wheel Color</h3>
              <div className="grid grid-cols-5 gap-2">
                {wheelColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCustomization({ wheelColor: color })}
                    className={`w-12 h-12 rounded-lg border-4 transition-all ${
                      customization.wheelColor === color
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                💰 Upgrades cost virtual coins. In a real game, these would be earned through gameplay!
              </p>
            </div>

            {/* Engine Upgrade */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Engine Power</h3>
                <span className="text-sm text-gray-600">Level {customization.upgrades.engine}/5</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {getUpgradeDescription('engine', customization.upgrades.engine)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded ${
                        level <= customization.upgrades.engine ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => updateUpgrades({ engine: Math.min(5, customization.upgrades.engine + 1) })}
                  disabled={customization.upgrades.engine >= 5}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                >
                  {customization.upgrades.engine >= 5 ? 'Max Level' : `Upgrade ($${getUpgradeCost(customization.upgrades.engine)})`}
                </button>
              </div>
            </div>

            {/* Brakes Upgrade */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Braking System</h3>
                <span className="text-sm text-gray-600">Level {customization.upgrades.brakes}/5</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {getUpgradeDescription('brakes', customization.upgrades.brakes)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded ${
                        level <= customization.upgrades.brakes ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => updateUpgrades({ brakes: Math.min(5, customization.upgrades.brakes + 1) })}
                  disabled={customization.upgrades.brakes >= 5}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                >
                  {customization.upgrades.brakes >= 5 ? 'Max Level' : `Upgrade ($${getUpgradeCost(customization.upgrades.brakes)})`}
                </button>
              </div>
            </div>

            {/* Handling Upgrade */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Handling & Suspension</h3>
                <span className="text-sm text-gray-600">Level {customization.upgrades.handling}/5</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {getUpgradeDescription('handling', customization.upgrades.handling)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded ${
                        level <= customization.upgrades.handling ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => updateUpgrades({ handling: Math.min(5, customization.upgrades.handling + 1) })}
                  disabled={customization.upgrades.handling >= 5}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                >
                  {customization.upgrades.handling >= 5 ? 'Max Level' : `Upgrade ($${getUpgradeCost(customization.upgrades.handling)})`}
                </button>
              </div>
            </div>

            {/* Nitro Upgrade */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Nitro Boost</h3>
                <span className="text-sm text-gray-600">Level {customization.upgrades.nitro}/3</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {getUpgradeDescription('nitro', customization.upgrades.nitro)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded ${
                        level <= customization.upgrades.nitro ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => updateUpgrades({ nitro: Math.min(3, customization.upgrades.nitro + 1) })}
                  disabled={customization.upgrades.nitro >= 3}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                >
                  {customization.upgrades.nitro >= 3 ? 'Max Level' : `Upgrade ($${getUpgradeCost(customization.upgrades.nitro)})`}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}