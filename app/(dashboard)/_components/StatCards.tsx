"use client";

import { useState, useEffect } from "react";
import {
  Users,
  User,
  UserCheck,
  UserCog,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useRouter } from "next/navigation";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down";
  trendValue?: number;
  onClick?: () => void;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  onClick,
  className = "",
}: StatsCardProps) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );

  return (
    <Card
      className={`overflow-hidden border transition-all hover:shadow-md cursor-pointer ${
        onClick ? "hover:border-primary/50" : ""
      } ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">{value}</h3>
              {trendValue && (
                <div className="flex items-center gap-1 text-sm">
                  {trendIcon}
                  <span className={`font-medium ${trendColor}`}>
                    {trendValue}%
                  </span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StudentStats {
  total: number;
  male: number;
  female: number;
  active: number;
  inactive: number;
  graduated: number;
  suspended: number;
}

interface StudentStatsCardsProps {
  showTrends?: boolean;
  compact?: boolean;
  onCardClick?: (type: "total" | "male" | "female" | "active") => void;
}

export const StudentStatsCards = ({
  showTrends = false,
  compact = false,
  onCardClick,
}: StudentStatsCardsProps) => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/students/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching student stats:", err);
      setError("Failed to load statistics");
      // For demo purposes, use mock data
      setStats({
        total: 1247,
        male: 680,
        female: 567,
        active: 1020,
        inactive: 120,
        graduated: 95,
        suspended: 12,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type: "total" | "male" | "female" | "active") => {
    if (onCardClick) {
      onCardClick(type);
    } else {
      // Default navigation
      const params = new URLSearchParams();
      switch (type) {
        case "male":
        case "female":
          params.set("gender", type.toUpperCase());
          router.push(`/students?${params.toString()}`);
          break;
        case "active":
          params.set("status", "ACTIVE");
          router.push(`/students?${params.toString()}`);
          break;
        default:
          router.push("/students");
          break;
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`grid ${
          compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        } gap-4`}
      >
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className={`grid ${
          compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        } gap-4`}
      >
        <Card className="border-dashed border-2">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load stats</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const malePercentage = Math.round((stats.male / stats.total) * 100);
  const femalePercentage = Math.round((stats.female / stats.total) * 100);
  const activePercentage = Math.round((stats.active / stats.total) * 100);

  const cardProps = {
    showTrends,
    onClick: handleCardClick,
  };

  return (
    <div
      className={`grid ${
        compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      } gap-4`}
    >
      {/* Total Students Card */}
      <StatsCard
        title="Total Students"
        value={stats.total.toLocaleString()}
        icon={<Users className="h-6 w-6 text-primary" />}
        description={`${stats.graduated} graduated, ${stats.suspended} suspended`}
        trend={stats.total > 1200 ? "up" : "down"}
        trendValue={showTrends ? 8.2 : undefined}
        onClick={() => handleCardClick("total")}
        className="border-l-4 border-l-primary"
      />

      {/* Male Students Card */}
      <StatsCard
        title="Male Students"
        value={stats.male.toLocaleString()}
        icon={<User className="h-6 w-6 text-blue-600" />}
        description={`${malePercentage}% of total students`}
        trend={stats.male > stats.female ? "up" : "down"}
        trendValue={showTrends ? 3.5 : undefined}
        onClick={() => handleCardClick("male")}
        className="border-l-4 border-l-blue-500"
      />

      {/* Female Students Card */}
      <StatsCard
        title="Female Students"
        value={stats.female.toLocaleString()}
        icon={<UserCog className="h-6 w-6 text-pink-600" />}
        description={`${femalePercentage}% of total students`}
        trend={stats.female > 500 ? "up" : "down"}
        trendValue={showTrends ? 5.1 : undefined}
        onClick={() => handleCardClick("female")}
        className="border-l-4 border-l-pink-500"
      />

      {/* Active Students Card */}
      <StatsCard
        title="Active Students"
        value={stats.active.toLocaleString()}
        icon={<UserCheck className="h-6 w-6 text-green-600" />}
        description={`${activePercentage}% active rate`}
        trend={stats.active > 1000 ? "up" : "down"}
        trendValue={showTrends ? 2.3 : undefined}
        onClick={() => handleCardClick("active")}
        className="border-l-4 border-l-green-500"
      />
    </div>
  );
};
