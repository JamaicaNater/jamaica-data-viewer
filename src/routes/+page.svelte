<script lang="ts">
  // Nothing fancy on home page
</script>

<svelte:head>
  <title>Jamaica Data Viewer</title>
</svelte:head>

<main class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-green-50 to-blue-50 p-6">
  <div class="max-w-2xl text-center space-y-6">
    <h1 class="text-5xl font-extrabold text-gray-800">
      Jamaica Data Viewer
    </h1>

    <p class="text-lg text-gray-600">
      Welcome! Explore election data by navigating to the Elections page. Dive into insights and visualize the numbers easily.
    </p>

    <a 
      href="/elections" 
      class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
    >
      View Elections
    </a>
  </div>
</main>
