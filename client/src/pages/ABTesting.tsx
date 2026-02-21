import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trophy, TrendingUp, Mail, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ABTesting() {
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for creating new test
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [variants, setVariants] = useState([
    { variant_name: "A", subject_line: "" },
    { variant_name: "B", subject_line: "" },
  ]);

  // Queries
  const { data: overallStats } = trpc.abTesting.getOverallStats.useQuery();
  const { data: tests, refetch: refetchTests } = trpc.abTesting.getTests.useQuery();
  const { data: testResults } = trpc.abTesting.getTestResults.useQuery(
    { testId: selectedTestId! },
    { enabled: !!selectedTestId }
  );

  // Mutations
  const createTest = trpc.abTesting.createTest.useMutation({
    onSuccess: () => {
      toast.success("A/B test creado exitosamente");
      refetchTests();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const declareWinner = trpc.abTesting.declareWinner.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchTests();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateStatus = trpc.abTesting.updateTestStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado");
      refetchTests();
    },
  });

  const resetForm = () => {
    setTestName("");
    setTestDescription("");
    setVariants([
      { variant_name: "A", subject_line: "" },
      { variant_name: "B", subject_line: "" },
    ]);
  };

  const addVariant = () => {
    if (variants.length >= 5) {
      toast.error("Máximo 5 variantes permitidas");
      return;
    }
    const nextLetter = String.fromCharCode(65 + variants.length); // A, B, C, D, E
    setVariants([...variants, { variant_name: nextLetter, subject_line: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) {
      toast.error("Mínimo 2 variantes requeridas");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleCreateTest = () => {
    if (!testName.trim()) {
      toast.error("El nombre del test es requerido");
      return;
    }
    if (variants.some(v => !v.subject_line.trim())) {
      toast.error("Todos los subject lines son requeridos");
      return;
    }
    createTest.mutate({
      name: testName,
      description: testDescription,
      variants,
    });
  };

  const handleDeclareWinner = (variantId: number) => {
    if (!selectedTestId) return;
    if (confirm("¿Declarar esta variante como ganadora y completar el test?")) {
      declareWinner.mutate({
        testId: selectedTestId,
        variantId,
      });
    }
  };

  // Prepare chart data
  const chartData = testResults?.variants.map((v: any) => ({
    name: v.variant_name,
    "Open Rate": v.open_rate,
    "Emails Sent": v.emails_sent,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="container max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">A/B Testing Dashboard</h1>
            <p className="text-slate-400">Optimiza tus subject lines con pruebas A/B</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                Crear A/B Test
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Crear Nuevo A/B Test</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Prueba diferentes subject lines para encontrar el más efectivo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Nombre del Test</label>
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Ej: Test de Subject Lines - Enero 2026"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Descripción (opcional)</label>
                  <Textarea
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="Describe el objetivo de este test..."
                    className="bg-slate-800 border-slate-700 text-white"
                    rows={2}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300">Variantes</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addVariant}
                      className="border-slate-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar Variante
                    </Button>
                  </div>
                  {variants.map((variant, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="w-16">
                        <Input
                          value={variant.variant_name}
                          disabled
                          className="bg-slate-800 border-slate-700 text-white text-center font-bold"
                        />
                      </div>
                      <Input
                        value={variant.subject_line}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].subject_line = e.target.value;
                          setVariants(newVariants);
                        }}
                        placeholder="Subject line para esta variante..."
                        className="bg-slate-800 border-slate-700 text-white flex-1"
                      />
                      {variants.length > 2 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeVariant(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleCreateTest}
                  disabled={createTest.isPending}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  {createTest.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Test"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{overallStats?.total_tests || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Tests Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{overallStats?.active_tests || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Emails Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{overallStats?.total_emails_sent || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Open Rate Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{overallStats?.overall_open_rate || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Tests List and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tests List */}
          <Card className="bg-slate-900/50 border-slate-800 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Tests</CardTitle>
              <CardDescription className="text-slate-400">
                Selecciona un test para ver resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {tests?.map((test: any) => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTestId(test.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTestId === test.id
                      ? "bg-slate-800 border-cyan-500"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{test.name}</h3>
                    <Badge
                      variant={
                        test.status === "active"
                          ? "default"
                          : test.status === "completed"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        test.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-500/50"
                          : test.status === "completed"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                          : "bg-slate-700 text-slate-400"
                      }
                    >
                      {test.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{test.variant_count} variantes</span>
                    <span>{test.total_emails_sent} emails</span>
                  </div>
                </div>
              ))}
              {(!tests || tests.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay tests creados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Resultados del Test</CardTitle>
              {testResults && (
                <CardDescription className="text-slate-400">
                  {testResults.test.name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!selectedTestId ? (
                <div className="text-center py-12 text-slate-500">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un test para ver los resultados</p>
                </div>
              ) : testResults ? (
                <div className="space-y-6">
                  {/* Recommendation */}
                  {testResults.isSignificant && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Trophy className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-400 mb-1">Ganador Estadísticamente Significativo</h4>
                          <p className="text-sm text-slate-300">{testResults.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!testResults.isSignificant && testResults.variants.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-1">Más Datos Necesarios</h4>
                          <p className="text-sm text-slate-300">{testResults.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart */}
                  {chartData.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-4">Comparación de Open Rates</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="Open Rate" fill="#06b6d4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Variants Table */}
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Variantes</h3>
                    {testResults.variants.map((variant: any, index: number) => (
                      <div
                        key={variant.id}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">
                              {variant.variant_name}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{variant.subject_line}</h4>
                              <p className="text-xs text-slate-400">
                                {variant.emails_sent} enviados • {variant.emails_opened} abiertos
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">{variant.open_rate}%</div>
                            {index === 0 && testResults.variants.length > 1 && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 mt-1">
                                Mejor
                              </Badge>
                            )}
                          </div>
                        </div>
                        {testResults.test.status === "active" && testResults.isSignificant && index === 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleDeclareWinner(variant.id)}
                            disabled={declareWinner.isPending}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                          >
                            {declareWinner.isPending ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Declarando...
                              </>
                            ) : (
                              <>
                                <Trophy className="w-3 h-3 mr-2" />
                                Declarar Ganador
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-500" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
