/**
 * Settings page translations
 */
export default {
  title: 'Settings',
  subtitle: 'Manage your personal preferences.',
  tabs: {
    general: 'General',
    appearance: 'Appearance',
    devtools: 'DevTools',
  },
  language: {
    title: 'Language',
    subtitle: 'Select your preferred language',
  },
  devtools: {
    title: 'Development',
    subtitle: 'Development and testing configurations.',
    useMockData: 'Use mock data',
    useMockDataDescription: 'Enable mock data for development and testing',
    backendUrl: 'Backend URL',
    backendUrlPlaceholder: 'Enter backend URL',
    backendUrlDescription: 'The URL of your backend API server',
    backendUrlSaved: 'Backend URL saved successfully',
    save: 'Save',
    aiModels: {
      title: 'AI Models',
      subtitle: 'Manage available AI models and their configurations.',
      loading: 'Loading available AI models...',
      loadingModels: 'Loading models...',
      errorLoading: 'Failed to load AI models.',
      errorMessage: 'Error loading models. Please try again later.',
      emptyState: 'No models available.',
      columns: {
        model: 'Model',
        provider: 'Provider',
        mediaTypes: 'Media Types',
        modelId: 'Model ID',
        status: 'Status',
      },
      defaultModels: {
        title: 'Default Models',
        subtitle:
          'Set the default model for each media type. Only enabled models are available for selection.',
        noModelsAvailable: 'No models available',
        selectDefaultModel: 'Select default model',
        currentModel: 'Current: {{modelName}} by {{provider}}',
        noEnabledModels: 'No enabled models available. Enable at least one model to set defaults.',
      },
    },
    dangerZone: {
      title: 'Danger Zone',
      subtitle: 'Irreversible and destructive actions.',
      deleteEverything: 'Delete Everything',
      deleteEverythingMessage: "BOOM! Everything has been deleted! And it's your fault.",
    },
  },
};
