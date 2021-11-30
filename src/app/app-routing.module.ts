import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PostListComponent } from "./posts/post-list/post-list.component";
import { PostCreateComponent } from "./posts/post-create/post-create.component";
import { AuthGuard } from "./auth/auth.guard";
import { ProfileComponent } from "./profile/profile.component";

const routes: Routes = [
  { path: "", component: PostListComponent },
  { path: "create", component: PostCreateComponent, canActivate: [AuthGuard] },
  {
    path: "my-profile/:profileId",
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: "profile/:profileId", component: ProfileComponent },
  {
    path: "edit/:postId",
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "apply/:postId",
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  { path: "auth", loadChildren: "./auth/auth.module#AuthModule" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
