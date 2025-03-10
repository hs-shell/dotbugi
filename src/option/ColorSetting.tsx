import { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import type { CourseBase } from '@/content/types';
import { HexColorPicker } from 'react-colorful';

// Update the CourseColorSetting type to include opacity
export type CourseColorSetting = {
  courseId: string;
  color: string;
  colorType: 'solid' | 'gradient';
  gradient?: string;
  opacity?: number; // Add opacity property
};

// Recommended color presets
const colorPresets = [
  '#e2e2e2', // Light Gray
  '#ff75c3', // Pink
  '#ffa647', // Orange
  '#ffe83f', // Yellow
  '#9fff5b', // Lime
  '#70e2ff', // Cyan
  '#cd93ff', // Purple
  '#09203f', // Dark Blue
];

// Gradient presets
const gradientPresets = [
  'linear-gradient(to right, #ff75c3, #ffa647)',
  'linear-gradient(to right, #ffa647, #ffe83f)',
  'linear-gradient(to right, #ffe83f, #9fff5b)',
  'linear-gradient(to right, #9fff5b, #70e2ff)',
  'linear-gradient(to right, #70e2ff, #cd93ff)',
  'linear-gradient(to right, #cd93ff, #ff75c3)',
  'linear-gradient(to right, #AC32E4, #4801FF)',
  'linear-gradient(to right, #09203f, #537895)',
];

export default function ColorSetting() {
  const [courses, setCourses] = useState<CourseBase[]>([]);
  const [courseColors, setCourseColors] = useState<CourseColorSetting[]>([]);
  const [originalColors, setOriginalColors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDataFromStorage('courses', (data: string | null) => {
      if (data) {
        const loadedCourses: CourseBase[] = JSON.parse(data);
        setCourses(loadedCourses);
      }
    });
  }, []);

  useEffect(() => {
    loadDataFromStorage('courseColors', (data: string | null) => {
      if (data) {
        const loadedColors: CourseColorSetting[] = JSON.parse(data);

        const updatedColors = loadedColors.map((color) => ({
          ...color,
          colorType: color.colorType || 'solid',
        }));

        setCourseColors(updatedColors);

        const originals: Record<string, string> = {};
        updatedColors.forEach((item) => {
          originals[item.courseId] = item.color;
        });
        setOriginalColors(originals);
      }
    });
  }, []);

  useEffect(() => {
    if (courses.length > 0 && courseColors.length === 0) {
      const defaultColors = courses.map((course) => ({
        courseId: course.courseId,
        color: '#6366f1',
        colorType: 'solid' as const,
      }));
      setCourseColors(defaultColors);

      const originals: Record<string, string> = {};
      defaultColors.forEach((item) => {
        originals[item.courseId] = item.color;
      });
      setOriginalColors(originals);
    }
  }, [courses]);

  const handleColorChange = (
    courseId: string,
    newColor: string,
    colorType: 'solid' | 'gradient' = 'solid',
    gradientValue?: string,
    opacity?: number
  ) => {
    setCourseColors((prev) =>
      prev.map((item) => {
        if (item.courseId === courseId) {
          return {
            ...item,
            color: newColor,
            colorType,
            gradient: gradientValue,
            opacity: opacity !== undefined ? opacity : item.opacity || 1, // Preserve or set default opacity
          };
        }
        return item;
      })
    );
  };
  const resetToOriginal = (courseId: string) => {
    if (originalColors[courseId]) {
      handleColorChange(courseId, originalColors[courseId], 'solid');
    }
  };

  // Save color settings
  const handleSave = () => {
    saveDataToStorage('courseColors', JSON.stringify(courseColors));

    const originals: Record<string, string> = {};
    courseColors.forEach((item) => {
      originals[item.courseId] = item.color;
    });
    setOriginalColors(originals);

    toast({
      title: '색상 설정 저장 완료',
      description: '강의 색상 설정이 저장되었습니다.',
    });
  };

  const getCourseColorSetting = (courseId: string) => {
    return (
      courseColors.find((item) => item.courseId === courseId) || {
        courseId,
        color: '#6366f1',
        colorType: 'solid' as const,
      }
    );
  };

  const getOriginalColor = (courseId: string) => {
    return originalColors[courseId] || '#6366f1';
  };

  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">강의 색상 설정</h1>
        <p className="text-muted-foreground">각 강의에 표시될 색상을 설정합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            colorSetting={getCourseColorSetting(course.courseId)}
            originalColor={getOriginalColor(course.courseId)}
            onColorChange={handleColorChange}
            onReset={() => resetToOriginal(course.courseId)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          색상 저장
        </Button>
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: CourseBase;
  colorSetting: CourseColorSetting;
  originalColor: string;
  onColorChange: (
    courseId: string,
    color: string,
    colorType: 'solid' | 'gradient',
    gradient?: string,
    opacity?: number
  ) => void;
  onReset: () => void;
}

function CourseCard({ course, colorSetting, originalColor, onColorChange, onReset }: CourseCardProps) {
  const hasChanged = colorSetting.color !== originalColor;
  const [customColor, setCustomColor] = useState(colorSetting.color);
  const [customGradient, setCustomGradient] = useState(
    colorSetting.gradient || 'linear-gradient(to right, #ff75c3, #ffa647)'
  );
  const [gradientStartColor, setGradientStartColor] = useState('#ff75c3');
  const [gradientEndColor, setGradientEndColor] = useState('#ffa647');
  const [opacity, setOpacity] = useState(colorSetting.opacity || 1);

  useEffect(() => {
    setCustomColor(colorSetting.color);
    setOpacity(colorSetting.opacity || 1);
    if (colorSetting.gradient) {
      setCustomGradient(colorSetting.gradient);

      const gradientMatch = colorSetting.gradient.match(
        /linear-gradient\(to right, (#[0-9a-fA-F]{3,6}), (#[0-9a-fA-F]{3,6})\)/
      );
      if (gradientMatch) {
        setGradientStartColor(gradientMatch[1]);
        setGradientEndColor(gradientMatch[2]);
      }
    }
  }, [colorSetting]);

  const getBackgroundStyle = () => {
    const opacityValue = opacity !== undefined ? opacity : 1;

    switch (colorSetting.colorType) {
      case 'gradient':
        if (colorSetting.gradient) {
          const gradientMatch = colorSetting.gradient.match(
            /linear-gradient\(to right, (#[0-9a-fA-F]{3,6}), (#[0-9a-fA-F]{3,6})\)/
          );

          if (gradientMatch) {
            const startColor = gradientMatch[1];
            const endColor = gradientMatch[2];
            const startRgba = hexToRgba(startColor, opacityValue);
            const endRgba = hexToRgba(endColor, opacityValue);
            return { background: `linear-gradient(to right, ${startRgba}, ${endRgba})` };
          }
          return { background: colorSetting.gradient };
        }
        return { background: customGradient };

      case 'solid':
      default:
        return { backgroundColor: hexToRgba(colorSetting.color, opacityValue) };
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    hex = hex.replace('#', '');

    let r, g, b;
    if (hex.length === 3) {
      r = Number.parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = Number.parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = Number.parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
      r = Number.parseInt(hex.substring(0, 2), 16);
      g = Number.parseInt(hex.substring(2, 4), 16);
      b = Number.parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    if (colorSetting.colorType === 'solid') {
      onColorChange(course.courseId, customColor, 'solid', undefined, value);
    } else {
      onColorChange(course.courseId, customGradient, 'gradient', customGradient, value);
    }
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    onColorChange(course.courseId, value, 'solid', undefined, opacity);
  };

  const handleCustomGradientChange = (value: string) => {
    setCustomGradient(value);
    onColorChange(course.courseId, value, 'gradient', value, opacity);
  };

  const handleGradientColorChange = (startColor: string, endColor: string) => {
    const newGradient = `linear-gradient(to right, ${startColor}, ${endColor})`;
    setGradientStartColor(startColor);
    setGradientEndColor(endColor);
    setCustomGradient(newGradient);
    onColorChange(course.courseId, newGradient, 'gradient', newGradient, opacity);
  };

  const opacitySlider = (
    <div className="mt-4">
      <div className="flex justify-between mb-1">
        <label htmlFor={`opacity-slider-${course.courseId}`} className="text-xs text-muted-foreground">
          투명도
        </label>
        <span className="text-xs">{Math.round(opacity * 100)}%</span>
      </div>
      <input
        id={`opacity-slider-${course.courseId}`}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={opacity}
        onChange={(e) => handleOpacityChange(Number.parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
    </div>
  );

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>{course.courseTitle}</CardTitle>
        <CardDescription>{course.prof}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-12 h-12 p-0 rounded-lg border-1 relative">
                {/* 배경 색상을 적용할 요소 */}
                <div className="absolute inset-0 rounded-md" style={getBackgroundStyle()} />
                <span className="sr-only">색상 선택</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <Tabs defaultValue="solid" className="w-full">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="solid" className="flex-1">
                    Solid
                  </TabsTrigger>
                  <TabsTrigger value="gradient" className="flex-1">
                    Gradient
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="solid" className="mt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {colorPresets.map((color) => (
                      <div
                        key={color}
                        className="h-6 w-6 cursor-pointer rounded-md active:scale-105"
                        style={{ background: color }}
                        onClick={() => onColorChange(course.courseId, color, 'solid', undefined, opacity)}
                      />
                    ))}
                  </div>

                  <div className="mb-4">
                    <HexColorPicker
                      color={customColor}
                      onChange={(color) => handleCustomColorChange(color)}
                      className="w-full h-[120px]"
                    />
                  </div>

                  <div className="w-full mb-4">
                    <Input
                      id="custom"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  {opacitySlider}
                </TabsContent>

                <TabsContent value="gradient" className="mt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {gradientPresets.map((gradient, index) => (
                      <div
                        key={index}
                        className="h-6 w-6 cursor-pointer rounded-md active:scale-105"
                        style={{ background: gradient }}
                        onClick={() => onColorChange(course.courseId, gradient, 'gradient', gradient, opacity)}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">시작 색상</p>
                      <HexColorPicker
                        color={gradientStartColor}
                        onChange={(color) => handleGradientColorChange(color, gradientEndColor)}
                        className="w-full h-[120px]"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">끝 색상</p>
                      <HexColorPicker
                        color={gradientEndColor}
                        onChange={(color) => handleGradientColorChange(gradientStartColor, color)}
                        className="w-full h-[120px]"
                      />
                    </div>
                  </div>

                  <div className="h-6 w-full rounded-md mb-2" style={{ background: customGradient }} />

                  {opacitySlider}
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
          <div className="flex flex-col">
            <span className="text-sm font-medium">선택된 스타일</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {colorSetting.colorType === 'solid'
                  ? `${colorSetting.color} (${Math.round((colorSetting.opacity || 1) * 100)}%)`
                  : `Gradient (${Math.round((colorSetting.opacity || 1) * 100)}%)`}
              </code>
            </div>
          </div>
          {hasChanged && (
            <Button variant="ghost" size="icon" className="ml-auto" onClick={onReset} title="원래 색상으로 되돌리기">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
