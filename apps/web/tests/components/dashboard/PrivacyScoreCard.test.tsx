import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrivacyScoreCard } from '@/components/dashboard/PrivacyScoreCard';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockScore = {
  totalScore: 85,
  riskLevel: 'low' as const,
  breakdown: {
    ipPrivacy: 18,
    dnsPrivacy: 15,
    webrtcPrivacy: 15,
    fingerprintResistance: 22,
    browserConfig: 15,
  },
  vulnerabilities: [],
};

const mockScoreWithVulnerabilities = {
  ...mockScore,
  totalScore: 45,
  riskLevel: 'high' as const,
  vulnerabilities: [
    {
      category: 'ip',
      severity: 'high' as const,
      title: 'IP Leak Detected',
      description: 'Your real IP is exposed',
      recommendation: 'Use a VPN',
    },
    {
      category: 'dns',
      severity: 'medium' as const,
      title: 'DNS Leak',
      description: 'DNS requests are visible',
      recommendation: 'Enable encrypted DNS',
    },
    {
      category: 'webrtc',
      severity: 'high' as const,
      title: 'WebRTC Leak',
      description: 'WebRTC reveals your IP',
      recommendation: 'Disable WebRTC',
    },
  ],
};

describe('PrivacyScoreCard', () => {
  describe('loading state', () => {
    it('should render loading skeleton when loading is true', () => {
      render(<PrivacyScoreCard score={null} loading={true} />);

      const loadingContainer = document.querySelector('.animate-pulse');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('should not render score when loading', () => {
      render(<PrivacyScoreCard score={mockScore} loading={true} />);

      expect(screen.queryByText('85')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render "no data" message when score is null', () => {
      render(<PrivacyScoreCard score={null} loading={false} />);

      expect(screen.getByText('dashboard.noDataYet')).toBeInTheDocument();
    });
  });

  describe('score display', () => {
    it('should render the total score', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should render score with leading zero for single digit', () => {
      const singleDigitScore = { ...mockScore, totalScore: 5 };
      render(<PrivacyScoreCard score={singleDigitScore} />);

      expect(screen.getByText('05')).toBeInTheDocument();
    });

    it('should display risk level', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('should apply correct color for low risk', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      const scoreElement = screen.getByText('85');
      expect(scoreElement).toHaveClass('text-cyan-300');
    });

    it('should apply correct color for medium risk', () => {
      const mediumRisk = { ...mockScore, riskLevel: 'medium' as const };
      render(<PrivacyScoreCard score={mediumRisk} />);

      const scoreElement = screen.getByText('85');
      expect(scoreElement).toHaveClass('text-yellow-300');
    });

    it('should apply correct color for high risk', () => {
      const highRisk = { ...mockScore, riskLevel: 'high' as const };
      render(<PrivacyScoreCard score={highRisk} />);

      const scoreElement = screen.getByText('85');
      expect(scoreElement).toHaveClass('text-orange-400');
    });

    it('should apply correct color for critical risk', () => {
      const criticalRisk = { ...mockScore, riskLevel: 'critical' as const };
      render(<PrivacyScoreCard score={criticalRisk} />);

      const scoreElement = screen.getByText('85');
      expect(scoreElement).toHaveClass('text-red-400');
    });
  });

  describe('breakdown display', () => {
    it('should display all breakdown categories', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.getByText('privacyScore.ipPrivacy')).toBeInTheDocument();
      expect(screen.getByText('privacyScore.dnsPrivacy')).toBeInTheDocument();
      expect(screen.getByText('privacyScore.webrtcPrivacy')).toBeInTheDocument();
      expect(screen.getByText('privacyScore.fingerprintResistance')).toBeInTheDocument();
      expect(screen.getByText('privacyScore.browserConfig')).toBeInTheDocument();
    });

    it('should display breakdown scores with max values', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.getByText('18/20')).toBeInTheDocument();
      // Use getAllByText since 15/15 appears twice (DNS and WebRTC both have 15/15)
      expect(screen.getAllByText('15/15')).toHaveLength(2);
      expect(screen.getByText('22/30')).toBeInTheDocument();
    });
  });

  describe('statistics display', () => {
    it('should display number of leaks/vulnerabilities', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display integrity percentage', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      // Integrity is 100 - totalScore
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should display entropy/fingerprint resistance', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.getByText('22')).toBeInTheDocument();
    });
  });

  describe('vulnerabilities display', () => {
    it('should not display vulnerabilities section when none exist', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      expect(screen.queryByText('dashboard.vulnerabilities')).not.toBeInTheDocument();
    });

    it('should display vulnerabilities section when vulnerabilities exist', () => {
      render(<PrivacyScoreCard score={mockScoreWithVulnerabilities} />);

      expect(screen.getByText('dashboard.vulnerabilities')).toBeInTheDocument();
    });

    it('should display first two vulnerabilities', () => {
      render(<PrivacyScoreCard score={mockScoreWithVulnerabilities} />);

      expect(screen.getByText('IP Leak Detected')).toBeInTheDocument();
      expect(screen.getByText('DNS Leak')).toBeInTheDocument();
    });

    it('should display recommendations for vulnerabilities', () => {
      render(<PrivacyScoreCard score={mockScoreWithVulnerabilities} />);

      expect(screen.getByText('Use a VPN')).toBeInTheDocument();
      expect(screen.getByText('Enable encrypted DNS')).toBeInTheDocument();
    });

    it('should show count of additional vulnerabilities', () => {
      render(<PrivacyScoreCard score={mockScoreWithVulnerabilities} />);

      expect(screen.getByText('+1 more findings')).toBeInTheDocument();
    });

    it('should not show "more findings" when 2 or fewer vulnerabilities', () => {
      const twoVulns = {
        ...mockScoreWithVulnerabilities,
        vulnerabilities: mockScoreWithVulnerabilities.vulnerabilities.slice(0, 2),
      };
      render(<PrivacyScoreCard score={twoVulns} />);

      expect(screen.queryByText(/more findings/)).not.toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should have specimen-container class for main score display', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      const containers = document.querySelectorAll('.specimen-container');
      expect(containers.length).toBeGreaterThan(0);
    });

    it('should have lab-panel class for breakdown section', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      const labPanel = document.querySelector('.lab-panel');
      expect(labPanel).toBeInTheDocument();
    });
  });

  describe('progress bars', () => {
    it('should render progress bars for each breakdown category', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      // There should be 5 progress bars
      const progressBars = document.querySelectorAll('.bg-gradient-to-r');
      expect(progressBars.length).toBe(5);
    });

    it('should have correct width based on score/max ratio', () => {
      render(<PrivacyScoreCard score={mockScore} />);

      const progressBars = document.querySelectorAll('.bg-gradient-to-r');

      // IP Privacy: 18/20 = 90%
      expect(progressBars[0]).toHaveStyle({ width: '90%' });

      // DNS Privacy: 15/15 = 100%
      expect(progressBars[1]).toHaveStyle({ width: '100%' });
    });
  });
});
