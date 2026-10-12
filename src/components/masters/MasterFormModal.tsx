import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  PlusCircle,
  RotateCcw,
  AlertCircle,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { MasterMetadata, MasterRecord } from '../../types/masters';
import { PermissionMatrix } from './PermissionMatrix';

interface MasterFormModalProps {
  metadata: MasterMetadata;
  record?: MasterRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MasterRecord>, saveAndNew?: boolean) => void;
}

export const MasterFormModal: React.FC<MasterFormModalProps> = ({
  metadata,
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEdit = !!record;
  const sections = metadata.formSections;

  const [activeTab, setActiveTab] = useState<string>(sections[0]?.id || '');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form state when opening or record changes
  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({ ...record });
      } else {
        const defaults: Record<string, any> = {
          is_active: true,
        };
        // Auto-generate code prefix if not existing
        defaults[metadata.identifierKey || 'code'] = `${metadata.codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

        sections.forEach((sec) => {
          sec.fields.forEach((f) => {
            if (f.defaultValue !== undefined) {
              defaults[f.name] = f.defaultValue;
            } else if (f.type === 'switch' || f.type === 'checkbox') {
              defaults[f.name] = f.defaultValue ?? true;
            } else if (f.type === 'number') {
              defaults[f.name] = f.defaultValue ?? '';
            } else {
              defaults[f.name] = '';
            }
          });
        });
        setFormData(defaults);
      }
      setErrors({});
      setTouched({});
      setActiveTab(sections[0]?.id || '');
    }
  }, [isOpen, record, metadata]);

  if (!isOpen) return null;

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name: string, value: any): string | null => {
    for (const section of sections) {
      const field = section.fields.find((f) => f.name === name);
      if (field) {
        if (field.required && (value === undefined || value === null || value === '')) {
          const errMsg = `${field.label} is required`;
          setErrors((prev) => ({ ...prev, [name]: errMsg }));
          return errMsg;
        }
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            const errMsg = 'Enter a valid email address';
            setErrors((prev) => ({ ...prev, [name]: errMsg }));
            return errMsg;
          }
        }
        if (field.type === 'number' && value !== '' && isNaN(Number(value))) {
          const errMsg = 'Must be a valid number';
          setErrors((prev) => ({ ...prev, [name]: errMsg }));
          return errMsg;
        }
      }
    }
    return null;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    sections.forEach((sec) => {
      sec.fields.forEach((f) => {
        const val = formData[f.name];
        if (f.required && (val === undefined || val === null || val === '')) {
          newErrors[f.name] = `${f.label} is required`;
        }
        if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          newErrors[f.name] = 'Enter a valid email address';
        }
        if (f.type === 'number' && val !== '' && val !== undefined && isNaN(Number(val))) {
          newErrors[f.name] = 'Must be a valid number';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (saveAndNew: boolean = false) => {
    if (!validateAll()) {
      // Find which section has error and switch tab
      for (const sec of sections) {
        const hasErr = sec.fields.some((f) => errors[f.name] || (f.required && !formData[f.name]));
        if (hasErr) {
          setActiveTab(sec.id);
          break;
        }
      }
      return;
    }

    onSave(formData, saveAndNew);
  };

  const handleReset = () => {
    if (record) {
      setFormData({ ...record });
    } else {
      const resetObj: Record<string, any> = { is_active: true };
      resetObj[metadata.identifierKey || 'code'] = `${metadata.codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      sections.forEach((sec) => {
        sec.fields.forEach((f) => {
          resetObj[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
        });
      });
      setFormData(resetObj);
    }
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090c] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-5 py-3.5 bg-slate-50/70 dark:bg-[#0e0e12]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-red-600/15 dark:text-red-400 font-bold text-xs">
              {metadata.codePrefix}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {isEdit ? `Edit ${metadata.singularName}` : `Add New ${metadata.singularName}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {metadata.name} &bull; Required fields marked with{' '}
                <span className="text-red-500 font-bold">*</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation if multiple sections */}
        {sections.length > 1 && (
          <div className="flex shrink-0 overflow-x-auto border-b border-slate-200 dark:border-zinc-800 px-5 bg-white dark:bg-[#09090c]">
            {sections.map((sec, idx) => {
              const isSelected = activeTab === sec.id;
              const hasSectionError = sec.fields.some((f) => !!errors[f.name]);

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveTab(sec.id)}
                  className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{idx + 1}. {sec.title}</span>
                  {hasSectionError && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {sections.map((section) => {
            // If tabs are active, only show selected section
            if (sections.length > 1 && activeTab !== section.id) return null;

            return (
              <div key={section.id} className="space-y-4">
                {sections.length > 1 && section.description && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {section.description}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => {
                    const value = formData[field.name] ?? '';
                    const hasError = !!errors[field.name];

                    // Full-width fields
                    const isFullWidth =
                      field.type === 'textarea' ||
                      field.type === 'permission_matrix' ||
                      field.colSpan === 2;

                    return (
                      <div
                        key={field.name}
                        className={`space-y-1.5 ${isFullWidth ? 'sm:col-span-2' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1 font-bold">*</span>
                            )}
                          </label>
                          {field.helpText && (
                            <span className="text-[10.5px] text-slate-400 dark:text-zinc-500">
                              {field.helpText}
                            </span>
                          )}
                        </div>

                        {/* Field Controls */}
                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'password' && (
                          <input
                            type="password"
                            value={value}
                            placeholder={field.placeholder || '••••••••'}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'number' && (
                          <input
                            type="number"
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              handleChange(
                                field.name,
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'email' && (
                          <input
                            type="email"
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'phone' && (
                          <input
                            type="tel"
                            value={value}
                            placeholder={field.placeholder || '+91 98765 43210'}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'date' && (
                          <input
                            type="date"
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          >
                            <option value="">-- Select {field.label} --</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            rows={3}
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={`w-full rounded-md border px-3 py-2 text-xs transition-colors bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 ${
                              hasError
                                ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-blue-600 dark:focus:border-red-500'
                            }`}
                          />
                        )}

                        {field.type === 'switch' && (
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => handleChange(field.name, !value)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                value
                                  ? 'bg-blue-600 dark:bg-red-600'
                                  : 'bg-slate-300 dark:bg-zinc-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  value ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="text-xs text-slate-600 dark:text-zinc-400">
                              {value ? 'Active / Enabled' : 'Inactive / Disabled'}
                            </span>
                          </div>
                        )}

                        {field.type === 'file' && (
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer text-slate-700 dark:text-zinc-200 transition-colors">
                              <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                              <span>Choose File</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleChange(field.name, e.target.files[0].name);
                                  }
                                }}
                              />
                            </label>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[200px]">
                              {value || 'No file selected'}
                            </span>
                          </div>
                        )}

                        {field.type === 'permission_matrix' && (
                          <div className="pt-2">
                            <PermissionMatrix
                              value={value}
                              onChange={(newMatrix) => handleChange(field.name, newMatrix)}
                            />
                          </div>
                        )}

                        {/* Error Message */}
                        {hasError && (
                          <div className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors[field.name]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0e0e12] px-5 py-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {!isEdit && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="flex items-center gap-1.5 rounded-md border border-blue-600 dark:border-red-600 bg-blue-50 text-blue-700 dark:bg-red-950/40 dark:text-red-300 px-3.5 py-1.5 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Save & New</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white dark:bg-red-600 dark:hover:bg-red-700 px-4 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isEdit ? 'Update Changes' : 'Create Record'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
