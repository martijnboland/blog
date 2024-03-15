---
title: "NuGet package restore with multiple repositories and file shares"
date: "2013-03-19"
categories: 
  - "net"
tags: 
  - "nuget"
---

To enable NuGet package restore from multiple repositories you have to edit the NuGet.targets file in the .nuget solution folder.

```xml
<ItemGroup Condition=" '$(PackageSources)' == '' ">
    <!-- Package sources used to restore packages. By default, registered sources under %APPDATA%\NuGet\NuGet.Config will be used -->
    <!-- The official NuGet package source (https://nuget.org/api/v2/) will be excluded if package sources are specified and it does not appear in the list -->
    <PackageSource Include="https://nuget.org/api/v2/" />
    <PackageSource Include="\\\\my-server\\my-packages\\" />
</ItemGroup>
```

**Important: escape the backslashes in the file share path, or you’ll get a very cryptic error message!**
